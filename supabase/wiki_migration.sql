-- À exécuter une seule fois dans Supabase > SQL Editor.
create table if not exists public.wiki_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.wiki_submissions (
  id uuid primary key default gen_random_uuid(), created_by uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('Lore', 'Règle', 'Lieu', 'Créature', 'Personnalité')),
  section text not null default 'Communauté', title text not null check (char_length(title) between 2 and 100),
  subtitle text not null default '', content text not null check (char_length(content) between 20 and 10000),
  source text not null default '', status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderator_note text, notified_at timestamptz, created_at timestamptz not null default now(),
  reviewed_at timestamptz, reviewed_by uuid references auth.users(id)
);
create or replace function public.is_wiki_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.wiki_admins where user_id = auth.uid()) $$;
grant execute on function public.is_wiki_admin() to anon, authenticated;
alter table public.wiki_admins enable row level security;
alter table public.wiki_submissions enable row level security;
create policy "Admins see admin list" on public.wiki_admins for select using (public.is_wiki_admin());
create policy "Approved wiki is public" on public.wiki_submissions for select using (status = 'approved');
create policy "Authors see their proposals" on public.wiki_submissions for select using (auth.uid() = created_by);
create policy "Admins see all proposals" on public.wiki_submissions for select using (public.is_wiki_admin());
create policy "Users submit proposals" on public.wiki_submissions for insert with check (auth.uid() = created_by and status = 'pending');
create policy "Admins moderate proposals" on public.wiki_submissions for update using (public.is_wiki_admin()) with check (public.is_wiki_admin());
insert into public.wiki_admins(user_id)
select id from auth.users where lower(email) = 'jonathan.ragot@gmail.com'
on conflict do nothing;
