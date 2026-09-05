-- Interface d'administration du Grimoire Elderwood.
-- À exécuter une fois dans Supabase > SQL Editor.

create or replace function public.get_admin_users()
returns table (
  user_id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  note_count bigint,
  storage_bytes bigint
)
language plpgsql
security definer
set search_path = public, auth, storage
as $$
begin
  if not public.is_wiki_admin() then
    raise exception 'Accès administrateur requis' using errcode = '42501';
  end if;

  return query
  select
    account.id,
    coalesce(account.email, '')::text,
    coalesce(account.raw_user_meta_data ->> 'display_name', '')::text,
    account.created_at,
    account.last_sign_in_at,
    (select count(*) from public.notes n where n.user_id = account.id),
    (select coalesce(sum(coalesce((o.metadata ->> 'size')::bigint, 0)), 0)::bigint
       from storage.objects o
      where o.bucket_id = 'grimoire-images'
        and o.name like account.id::text || '/%')
  from auth.users account
  order by account.created_at desc;
end;
$$;

revoke all on function public.get_admin_users() from public;
grant execute on function public.get_admin_users() to authenticated;

drop policy if exists "Admins inspect user notes" on public.notes;
create policy "Admins inspect user notes"
on public.notes for select
using (public.is_wiki_admin());

drop policy if exists "Admins inspect grimoire images" on storage.objects;
create policy "Admins inspect grimoire images"
on storage.objects for select
using (bucket_id = 'grimoire-images' and public.is_wiki_admin());
