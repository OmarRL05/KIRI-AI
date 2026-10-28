-- KIRI initial schema (compatible with both Supabase Auth and device-id sessions)
-- Ejecuta este script directamente en el SQL Editor de tu dashboard de Supabase:
-- https://supabase.com/dashboard/project/xqagfkccxgudzxwljcus/sql/new

create table if not exists public.profiles (
  id text primary key,
  learning_language text not null default 'en'
    check (learning_language in ('en', 'fr', 'de', 'it', 'pt', 'ja')),
  native_language text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_all" on public.profiles;
create policy "profiles_all" on public.profiles
  for all to anon, authenticated
  using (true)
  with check (true);

create table if not exists public.objects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  language text not null
    check (language in ('en', 'fr', 'de', 'it', 'pt', 'ja')),
  word text not null,
  translation text not null,
  phonetic text,
  example text,
  example_translation text,
  category text,
  confidence real,
  image_path text not null,
  learned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists objects_user_created_idx
  on public.objects (user_id, created_at desc);

create index if not exists objects_user_lang_word_idx
  on public.objects (user_id, language, lower(word));

alter table public.objects enable row level security;

drop policy if exists "objects_all" on public.objects;
create policy "objects_all" on public.objects
  for all to anon, authenticated
  using (true)
  with check (true);

create table if not exists public.analysis_log (
  id bigserial primary key,
  user_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists analysis_log_user_created_idx
  on public.analysis_log (user_id, created_at desc);

alter table public.analysis_log enable row level security;

drop policy if exists "analysis_log_all" on public.analysis_log;
create policy "analysis_log_all" on public.analysis_log
  for all to anon, authenticated
  using (true)
  with check (true);

-- Bucket de imágenes para los objetos fotografiados
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('objects', 'objects', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "objects_storage_all" on storage.objects;
create policy "objects_storage_all" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'objects')
  with check (bucket_id = 'objects');
