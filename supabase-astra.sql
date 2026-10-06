-- ============================================================
-- GAMIFIKATHINK: Astra Duplicate — Tambahan Schema
-- Jalankan setelah supabase-schema.sql + supabase-gamification.sql
-- di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Materi upload (teks hasil parse PDF/gambar + ringkasan AI)
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_text TEXT NOT NULL,
  summary TEXT,
  subject TEXT DEFAULT 'Matematika',
  level TEXT DEFAULT 'SMA',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_materials_user ON study_materials(user_id, created_at DESC);

-- 2. Hasil kuis/ujian (untuk analisis + knowledge gaps + dashboard)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  mode TEXT DEFAULT 'boss', -- boss | exam | tf | oral | flash
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  details JSONB DEFAULT '[]'::jsonb, -- [{q, picked, correct}]
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id, created_at DESC);

-- 3. Rencana belajar personal
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  deadline DATE,
  plan JSONB DEFAULT '[]'::jsonb, -- [{day, topic, tasks[]}]
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plans_user ON study_plans(user_id, created_at DESC);

-- 4. Streak harian (sinkron opsional; localStorage tetap source saat guest)
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SRS reviews (sinkron opsional; localStorage tetap jalan offline)
CREATE TABLE IF NOT EXISTS reviews (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_hash TEXT NOT NULL,
  interval_days INTEGER DEFAULT 1,
  next_due TIMESTAMPTZ DEFAULT now(),
  ease NUMERIC DEFAULT 2.5,
  PRIMARY KEY (user_id, card_hash)
);
CREATE INDEX IF NOT EXISTS idx_reviews_due ON reviews(user_id, next_due);

-- 6. Paket share kolaboratif (baca via kode, tanpa login)
CREATE TABLE IF NOT EXISTS shared_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL, -- {type, subject, level, items[]}
  code TEXT UNIQUE NOT NULL, -- 6 char
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_packs_code ON shared_packs(code);

-- RLS
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own materials" ON study_materials;
CREATE POLICY "own materials" ON study_materials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "own attempts" ON quiz_attempts;
CREATE POLICY "own attempts" ON quiz_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "own plans" ON study_plans;
CREATE POLICY "own plans" ON study_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "own streaks" ON streaks;
CREATE POLICY "own streaks" ON streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "own reviews" ON reviews;
CREATE POLICY "own reviews" ON reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- shared_packs: owner full, publik read by code (via anon key tetap perlu policy select terbuka)
DROP POLICY IF EXISTS "owner packs" ON shared_packs;
CREATE POLICY "owner packs" ON shared_packs FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);
DROP POLICY IF EXISTS "public read packs" ON shared_packs;
CREATE POLICY "public read packs" ON shared_packs FOR SELECT USING (true);
