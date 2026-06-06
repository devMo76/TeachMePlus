-- ============================================================
-- AcadMate — Seed Data
-- File: supabase/seed.sql
--
-- PURPOSE: Local development only.
-- This file is run automatically by the Supabase CLI
-- when you start a local Supabase instance.
-- (supabase start)
--
-- DO NOT run this manually in the cloud Supabase dashboard.
-- The cloud database was seeded inside the migration file:
-- 20240101000000_initial_schema.sql (Section 14)
-- ============================================================


-- University: UTM KL
INSERT INTO public.universities (id, name, city, country, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Universiti Teknologi Malaysia Kuala Lumpur',
  'Kuala Lumpur',
  'Malaysia',
  TRUE
)
ON CONFLICT (id) DO NOTHING;


-- Programme: Software Engineering at MJIIT
INSERT INTO public.programmes (id, university_id, name, faculty, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Software Engineering',
  'Malaysia-Japan International Institute of Technology',
  TRUE
)
ON CONFLICT (id) DO NOTHING;


-- Subjects
INSERT INTO public.subjects (id, university_id, programme_id, code, name, is_active)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'SECI1013',
    'Discrete Structure',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'SECJ1013',
    'Programming Technique 1',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'SECR1013',
    'Digital Logic',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'SECR1033',
    'Computer Organization and Architecture',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;