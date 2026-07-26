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

-- 4) Sesli mesajlar (R2'deki ses dosyalarının kaydı; yalnızca yönetici dinler)
create table if not exists public.voice_messages (
  id           uuid primary key default gen_random_uuid(),
  key          text not null,
  name         text,
  duration_sec int,
  created_at   timestamptz not null default now()
);
alter table public.voice_messages enable row level security;

-- Fotoğraf onayı: onay istenirse yeni fotoğraflar approved=false (beklemede) gelir.
alter table public.photos
  add column if not exists approved boolean not null default true;

-- Ek ayarlar: foto onayı + anasayfa geri sayımı
alter table public.app_settings
  add column if not exists require_photo_approval boolean not null default false;
alter table public.app_settings
  add column if not exists countdown_enabled boolean not null default false;
alter table public.app_settings
  add column if not exists countdown_kina_date date;
alter table public.app_settings
  add column if not exists countdown_dugun_date date;
alter table public.app_settings
  add column if not exists countdown_nisan_date date;

-- İçerik (admin panelinden düzenlenir; boşsa site.ts varsayılanına düşer)
alter table public.app_settings add column if not exists bride_name text;
alter table public.app_settings add column if not exists groom_name text;
alter table public.app_settings add column if not exists kina_eyebrow text;
alter table public.app_settings add column if not exists kina_welcome text;
alter table public.app_settings add column if not exists dugun_eyebrow text;
alter table public.app_settings add column if not exists dugun_welcome text;
alter table public.app_settings add column if not exists nisan_eyebrow text;
alter table public.app_settings add column if not exists nisan_welcome text;
alter table public.app_settings add column if not exists andac_desc text;
alter table public.app_settings add column if not exists foto_desc text;
-- Arka plan / paylaşım resmi (R2 anahtarı; boşsa /images/dans.jpg)
alter table public.app_settings add column if not exists background_key text;

-- 5) Ziyaretler (kendi ziyaretçi sayacımız; cihaz başına 1 kez eklenir)
create table if not exists public.visits (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.visits enable row level security;
