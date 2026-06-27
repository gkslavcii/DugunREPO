-- Sezin & Göksel — Supabase şeması
-- Supabase > SQL Editor'de çalıştır. Idempotent: tekrar çalıştırmak güvenlidir.
--
-- RLS her tabloda açık ve anon için HİÇBİR politika yok => tarayıcıdan/anon
-- anahtarıyla erişilemez. Tüm erişim sunucu tarafında service_role ile yapılır.

-- 1) Andaç notları
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  name       text,
  is_public  boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notes
  add column if not exists is_public boolean not null default false;
alter table public.notes enable row level security;

-- 2) Fotoğraflar (R2'deki dosyaların kaydı)
create table if not exists public.photos (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,
  url        text not null,
  created_at timestamptz not null default now()
);
alter table public.photos enable row level security;

-- 3) Site ayarları (anasayfa modu: "kina" / "dugun")
create table if not exists public.app_settings (
  id         int primary key default 1,
  mode       text not null default 'dugun',
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id, mode) values (1, 'dugun')
  on conflict (id) do nothing;
alter table public.app_settings enable row level security;
