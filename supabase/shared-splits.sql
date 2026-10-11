-- Run this once in your Supabase project's SQL Editor.
-- Enable Anonymous Sign-Ins in Authentication > Providers before using live splits.

create table if not exists public.shared_splits (
  id uuid primary key default gen_random_uuid(),
  join_code text not null unique check (join_code ~ '^[A-Z2-9]{6}$'),
  owner_id uuid not null references auth.users(id),
  state jsonb not null,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_split_members (
  split_id uuid not null references public.shared_splits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (split_id, user_id)
);

alter table public.shared_splits enable row level security;
alter table public.shared_split_members enable row level security;

create or replace function public.is_shared_split_member(p_split_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shared_split_members
    where split_id = p_split_id
      and user_id = auth.uid()
  );
$$;

revoke execute on function public.is_shared_split_member(uuid) from public, anon;
grant execute on function public.is_shared_split_member(uuid) to authenticated;

drop policy if exists "Members can read their splits" on public.shared_splits;
create policy "Members can read their splits"
  on public.shared_splits for select to authenticated
  using (public.is_shared_split_member(id));

drop policy if exists "Anonymous users can create their own splits" on public.shared_splits;
create policy "Anonymous users can create their own splits"
  on public.shared_splits for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Members can update open splits" on public.shared_splits;
create policy "Members can update open splits"
  on public.shared_splits for update to authenticated
  using (
    not is_closed and public.is_shared_split_member(id)
  )
  with check (
    not is_closed and public.is_shared_split_member(id)
  );

drop policy if exists "Members can read fellow memberships" on public.shared_split_members;
create policy "Members can read fellow memberships"
  on public.shared_split_members for select to authenticated
  using (public.is_shared_split_member(split_id));

drop policy if exists "Users can add themselves to a split" on public.shared_split_members;
create policy "Users can add themselves to a split"
  on public.shared_split_members for insert to authenticated
  with check (user_id = auth.uid());

create or replace function public.create_shared_split(
  p_join_code text,
  p_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  created_split public.shared_splits;
begin
  if auth.uid() is null then
    raise exception 'An authenticated session is required.';
  end if;

  insert into public.shared_splits (join_code, owner_id, state)
  values (upper(trim(p_join_code)), auth.uid(), p_state)
  returning * into created_split;

  insert into public.shared_split_members (split_id, user_id)
  values (created_split.id, auth.uid());

  return jsonb_build_object(
    'id', created_split.id,
    'join_code', created_split.join_code,
    'state', created_split.state
  );
end;
$$;

revoke execute on function public.create_shared_split(text, jsonb) from public, anon;
grant execute on function public.create_shared_split(text, jsonb) to authenticated;

create or replace function public.join_shared_split(p_join_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_split public.shared_splits;
begin
  if auth.uid() is null then
    raise exception 'An authenticated session is required.';
  end if;

  select * into selected_split
  from public.shared_splits
  where join_code = upper(trim(p_join_code))
    and is_closed = false;

  if selected_split.id is null then
    raise exception 'This join code is invalid or the split is closed.';
  end if;

  insert into public.shared_split_members (split_id, user_id)
  values (selected_split.id, auth.uid())
  on conflict do nothing;

  return jsonb_build_object(
    'id', selected_split.id,
    'join_code', selected_split.join_code,
    'state', selected_split.state
  );
end;
$$;

revoke execute on function public.join_shared_split(text) from public, anon;
grant execute on function public.join_shared_split(text) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shared_splits'
  ) then
    alter publication supabase_realtime add table public.shared_splits;
  end if;
end;
$$;
