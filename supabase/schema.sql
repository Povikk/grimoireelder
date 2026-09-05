-- À exécuter une seule fois dans l'éditeur SQL de Supabase.
create table if not exists public.notes (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id, user_id)
);

alter table public.notes enable row level security;

create policy "Users read their own notes"
on public.notes for select
using (auth.uid() = user_id);

create policy "Users create their own notes"
on public.notes for insert
with check (auth.uid() = user_id);

create policy "Users update their own notes"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete their own notes"
on public.notes for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('grimoire-images', 'grimoire-images', false, 5242880, array['image/webp'])
on conflict (id) do nothing;

create policy "Users read their own grimoire images"
on storage.objects for select
using (bucket_id = 'grimoire-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users upload their own grimoire images"
on storage.objects for insert
with check (bucket_id = 'grimoire-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update their own grimoire images"
on storage.objects for update
using (bucket_id = 'grimoire-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own grimoire images"
on storage.objects for delete
using (bucket_id = 'grimoire-images' and (storage.foldername(name))[1] = auth.uid()::text);

