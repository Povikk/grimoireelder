import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

type CloudNote = {
  id: string;
  image?: string;
  imagePath?: string;
  [key: string]: unknown;
};

export type WikiSubmission = {
  id: string;
  created_by: string;
  category: 'Lore' | 'Règle' | 'Lieu' | 'Créature' | 'Personnalité';
  section: string;
  title: string;
  subtitle: string;
  content: string;
  source: string;
  status: 'pending' | 'approved' | 'rejected';
  moderator_note?: string | null;
  created_at: string;
};

export type AdminUser = {
  user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  note_count: number;
  storage_bytes: number;
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

export async function loadWikiSubmissions(user?: User | null) {
  const client = getSupabase();
  if (!client) return [] as WikiSubmission[];
  const { data, error } = await client
    .from('wiki_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as WikiSubmission[];
}

export async function isWikiAdmin(user?: User | null) {
  const client = getSupabase();
  if (!client || !user) return false;
  const { data, error } = await client.rpc('is_wiki_admin');
  if (error) throw error;
  return Boolean(data);
}

export async function loadAdminUsers() {
  const client = getSupabase();
  if (!client) return [] as AdminUser[];
  const { data, error } = await client.rpc('get_admin_users');
  if (error) throw error;
  return (data || []) as AdminUser[];
}

export async function loadAdminNotes(userId: string): Promise<CloudNote[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('notes')
    .select('id,payload,image_path')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return Promise.all((data || []).map(async (row) => ({
    ...(row.payload as CloudNote),
    id: row.id,
    imagePath: row.image_path || undefined,
    image: await signedImage(client, row.image_path),
  })));
}

export async function submitWikiProposal(
  user: User,
  proposal: Pick<WikiSubmission, 'category' | 'section' | 'title' | 'subtitle' | 'content' | 'source'>,
) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase n’est pas configuré.');
  const { data, error } = await client
    .from('wiki_submissions')
    .insert({ ...proposal, created_by: user.id, status: 'pending' })
    .select('*')
    .single();
  if (error) throw error;
  const { error: notifyError } = await client.functions.invoke('notify-wiki-submission', {
    body: { submissionId: data.id },
  });
  return { submission: data as WikiSubmission, notificationSent: !notifyError };
}

export async function reviewWikiProposal(
  id: string,
  status: 'approved' | 'rejected',
  moderatorNote = '',
) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase n’est pas configuré.');
  const { error } = await client
    .from('wiki_submissions')
    .update({
      status,
      moderator_note: moderatorNote || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}
