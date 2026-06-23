-- Andaç (misafir notları) tablosu
-- Supabase > SQL Editor'de bir kez çalıştır.

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  name       text,
  created_at timestamptz not null default now()
);

-- Row Level Security açık; public (anon) anahtarı için HİÇBİR politika tanımlı değil.
-- => Tarayıcıdan/anon anahtarıyla kimse okuyamaz veya yazamaz.
-- Tüm erişim sunucu tarafında service_role anahtarıyla yapılır (RLS'i bypass eder):
--   * Misafir notu: server action ile eklenir.
--   * Notları okuma: yalnızca şifreli /admin panelinde.
alter table public.notes enable row level security;
