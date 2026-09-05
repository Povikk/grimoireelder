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

-- Contributions communautaires au wiki officiel.
create table if not exists public.wiki_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.wiki_submissions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('Lore', 'Règle', 'Lieu', 'Créature', 'Personnalité')),
  section text not null default 'Communauté',
  title text not null check (char_length(title) between 2 and 100),
  subtitle text not null default '',
  content text not null check (char_length(content) between 20 and 10000),
  source text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderator_note text,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create or replace function public.is_wiki_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.wiki_admins where user_id = auth.uid()) $$;

grant execute on function public.is_wiki_admin() to anon, authenticated;
alter table public.wiki_admins enable row level security;
alter table public.wiki_submissions enable row level security;

create policy "Admins see admin list" on public.wiki_admins for select
using (public.is_wiki_admin());
create policy "Approved wiki is public" on public.wiki_submissions for select
using (status = 'approved');
create policy "Authors see their proposals" on public.wiki_submissions for select
using (auth.uid() = created_by);
create policy "Admins see all proposals" on public.wiki_submissions for select
using (public.is_wiki_admin());
create policy "Users submit proposals" on public.wiki_submissions for insert
with check (auth.uid() = created_by and status = 'pending');
create policy "Admins moderate proposals" on public.wiki_submissions for update
using (public.is_wiki_admin()) with check (public.is_wiki_admin());

-- Le premier compte existant devient administrateur. Remplace cette ligne si besoin.
insert into public.wiki_admins(user_id)
select id from auth.users where lower(email) = 'jonathan.ragot@gmail.com'
on conflict do nothing;
