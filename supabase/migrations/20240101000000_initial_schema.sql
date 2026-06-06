-- ============================================================
-- AcadMate — Initial Schema Migration
-- File: 20240101000000_initial_schema.sql
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ============================================================
-- SECTION 1 — HELPER: updated_at TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- SECTION 2 — TABLE: universities (no RLS policies yet)
-- ============================================================

CREATE TABLE public.universities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'Malaysia',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Public read (no profile check needed)
CREATE POLICY "universities_read_all"
  ON public.universities FOR SELECT
  USING (is_active = TRUE);


-- ============================================================
-- SECTION 3 — TABLE: programmes (no RLS policies yet)
-- ============================================================

CREATE TABLE public.programmes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id  UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  faculty        TEXT NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

-- Public read (no profile check needed)
CREATE POLICY "programmes_read_all"
  ON public.programmes FOR SELECT
  USING (is_active = TRUE);


-- ============================================================
-- SECTION 4 — TABLE: profiles
-- Must be created before any policy that references profiles
-- ============================================================

CREATE TABLE public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT,
  university_id  UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  programme_id   UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
  year           INTEGER CHECK (year >= 1 AND year <= 6),
  avatar_url     TEXT,
  is_admin       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_read_all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = TRUE
    )
  );

CREATE POLICY "profiles_admin_update_all"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 5 — RLS ADMIN POLICIES for universities & programmes
-- Now that profiles exists, we can safely add admin policies
-- ============================================================

CREATE POLICY "universities_admin_all"
  ON public.universities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "programmes_admin_all"
  ON public.programmes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 6 — TABLE: subjects
-- ============================================================

CREATE TABLE public.subjects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id  UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  programme_id   UUID NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  code           TEXT NOT NULL,
  name           TEXT NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (programme_id, code)
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_read_all"
  ON public.subjects FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "subjects_admin_all"
  ON public.subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 7 — TABLE: tutor_applications
-- ============================================================

CREATE TABLE public.tutor_applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  current_state  TEXT NOT NULL
                   CHECK (current_state IN ('student', 'graduate')),
  bio            TEXT,
  teaching_mode  TEXT NOT NULL
                   CHECK (teaching_mode IN ('online', 'face_to_face', 'both')),
  consent_given  BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes    TEXT,
  verified_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id)
);

CREATE TRIGGER tutor_applications_updated_at
  BEFORE UPDATE ON public.tutor_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_applications_read_own"
  ON public.tutor_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tutor_applications_insert_own"
  ON public.tutor_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id AND consent_given = TRUE);

CREATE POLICY "tutor_applications_update_own_pending"
  ON public.tutor_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "tutor_applications_admin_read_all"
  ON public.tutor_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "tutor_applications_admin_update_all"
  ON public.tutor_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 8 — TABLE: tutor_subjects
-- ============================================================

CREATE TABLE public.tutor_subjects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id       UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade            TEXT NOT NULL,
  price_per_hour   NUMERIC(10, 2) NOT NULL CHECK (price_per_hour > 0),
  proof_file_url   TEXT,
  proof_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tutor_id, subject_id)
);

ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_subjects_read_approved"
  ON public.tutor_subjects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tutor_applications ta
      WHERE ta.user_id = tutor_subjects.tutor_id
      AND ta.status = 'approved'
    )
  );

CREATE POLICY "tutor_subjects_insert_own"
  ON public.tutor_subjects FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "tutor_subjects_update_own"
  ON public.tutor_subjects FOR UPDATE
  USING (auth.uid() = tutor_id);

CREATE POLICY "tutor_subjects_delete_own"
  ON public.tutor_subjects FOR DELETE
  USING (auth.uid() = tutor_id);

CREATE POLICY "tutor_subjects_admin_all"
  ON public.tutor_subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 9 — TABLE: bookings
-- ============================================================

CREATE TABLE public.bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id       UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN (
                       'pending', 'accepted', 'rejected',
                       'completed', 'cancelled', 'no_show'
                     )),
  requested_time   TIMESTAMPTZ NOT NULL,
  mode             TEXT NOT NULL
                     CHECK (mode IN ('online', 'face_to_face')),
  price_snapshot   NUMERIC(10, 2) NOT NULL CHECK (price_snapshot > 0),
  student_message  TEXT,
  tutor_response   TEXT,
  meeting_link     TEXT,
  paid             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bookings_no_self_booking CHECK (student_id != tutor_id)
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_read_as_student"
  ON public.bookings FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "bookings_insert_as_student"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "bookings_update_as_student"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = student_id AND status = 'pending');

CREATE POLICY "bookings_read_as_tutor"
  ON public.bookings FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "bookings_update_as_tutor"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = tutor_id);

CREATE POLICY "bookings_admin_all"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 10 — TABLE: reviews
-- ============================================================

CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (booking_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_read_all"
  ON public.reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "reviews_insert_own_completed"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.student_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

CREATE POLICY "reviews_admin_delete"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 11 — TABLE: reports
-- ============================================================

CREATE TABLE public.reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id        UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reason            TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  admin_action      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT reports_no_self_report CHECK (reporter_id != reported_user_id)
);

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_read_own"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "reports_insert_own"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_admin_all"
  ON public.reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ============================================================
-- SECTION 12 — ADD approved tutor read policy to profiles
-- Must come after tutor_applications table exists
-- ============================================================

CREATE POLICY "profiles_read_approved_tutors"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tutor_applications ta
      WHERE ta.user_id = profiles.id
      AND ta.status = 'approved'
    )
  );


-- ============================================================
-- SECTION 13 — TRIGGER: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- SECTION 14 — SEED DATA
-- ============================================================

INSERT INTO public.universities (id, name, city, country, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Universiti Teknologi Malaysia Kuala Lumpur',
  'Kuala Lumpur',
  'Malaysia',
  TRUE
);

INSERT INTO public.programmes (id, university_id, name, faculty, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Software Engineering',
  'Malaysia-Japan International Institute of Technology',
  TRUE
);

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
  );


-- ============================================================
-- END OF MIGRATION
-- ============================================================
-- Tables created (in dependency order):
--   universities, programmes, profiles, subjects,
--   tutor_applications, tutor_subjects, bookings, reviews, reports
--
-- Triggers:
--   handle_updated_at()  → profiles, tutor_applications, bookings, reports
--   handle_new_user()    → auto-creates profile row on signup
--
-- Seed data:
--   1 university, 1 programme, 4 subjects
-- ============================================================