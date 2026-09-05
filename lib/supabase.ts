import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

type CloudNote = {
  id: string;
  image?: string;
  imagePath?: string;
  [key: string]: unknown;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: SupabaseClient | null = null;

export const isSupabaseConfigured = Boolean(url && publicKey);

export function getSupabase() {
  if (!isSupabaseConfigured) return null;
  browserClient ??= createClient(url!, publicKey!, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return browserClient;
}

const dataUrlToBlob = async (value: string) => (await fetch(value)).blob();

async function signedImage(client: SupabaseClient, path?: string | null) {
  if (!path) return undefined;
  const { data } = await client.storage.from('grimoire-images').createSignedUrl(path, 60 * 60);
  return data?.signedUrl;
}

export async function loadPrivateNotes(user: User): Promise<CloudNote[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('notes')
    .select('id,payload,image_path')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return Promise.all(
    (data || []).map(async (row) => ({
      ...(row.payload as CloudNote),
      id: row.id,
      imagePath: row.image_path || undefined,
      image: await signedImage(client, row.image_path),
    })),
  );
}

export async function replacePrivateNotes<T extends { id: string; image?: string; imagePath?: string }>(user: User, notes: T[]) {
  const client = getSupabase();
  if (!client) return notes;
  const prepared = await Promise.all(
    notes.map(async (note) => {
      let imagePath = note.imagePath;
      if (note.image?.startsWith('data:image/')) {
        imagePath = `${user.id}/${note.id}.webp`;
        const blob = await dataUrlToBlob(note.image);
        const { error } = await client.storage
          .from('grimoire-images')
          .upload(imagePath, blob, { contentType: 'image/webp', upsert: true });
        if (error) throw error;
      }
      const { image: _image, imagePath: _imagePath, ...payload } = note;
      return {
        id: note.id,
        user_id: user.id,
        payload,
        image_path: imagePath || null,
        updated_at: new Date().toISOString(),
      };
    }),
  );
  if (prepared.length) {
    const { error } = await client.from('notes').upsert(prepared, { onConflict: 'id,user_id' });
    if (error) throw error;
  }
  const ids = prepared.map((note) => note.id);
  let deletion = client.from('notes').delete().eq('user_id', user.id);
  if (ids.length) deletion = deletion.not('id', 'in', `(${ids.map((id) => `"${id}"`).join(',')})`);
  const { error: deleteError } = await deletion;
  if (deleteError) throw deleteError;
  return prepared;
}

export async function updateProfileName(user: User, displayName: string) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.auth.updateUser({ data: { display_name: displayName } });
  if (error) throw error;
}
