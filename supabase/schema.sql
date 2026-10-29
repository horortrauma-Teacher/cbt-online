-- ============================================================================
-- SKEMA LENGKAP & IDEMPOTENT CBT ONLINE (SUPABASE / POSTGRESQL)
-- Mendukung: Multi-Siswa (1 Link untuk Banyak Siswa Sekelas), AI Generator, 
-- Upload File, Rekap Nilai, & Edit Soal
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM ROLE & STATUS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('guru', 'siswa');
    END IF;
END $$;

-- 2. TABEL PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    full_name TEXT NOT NULL DEFAULT 'Peserta Ujian',
    role user_role NOT NULL DEFAULT 'siswa',
    nisn TEXT,
    nip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL EXAMS (Daftar Ujian Hasil AI Generator)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT DEFAULT 'SMP',             -- 'SMP' atau 'SMA'
    class_grade TEXT DEFAULT '9',               -- '7', '8', '9', '10', '11', '12'
    topic TEXT,                                 -- Materi / Bab pokok bahasan
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    ALTER TABLE public.exams ALTER COLUMN created_by DROP NOT NULL;
    ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS grade_level TEXT DEFAULT 'SMP';
    ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS class_grade TEXT DEFAULT '9';
    ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS topic TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_created_by_fkey;

-- 4. TABEL QUESTIONS (Bank Soal Pilihan Ganda & Gambar)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    image_url TEXT,                             -- URL Gambar/Ilustrasi Soal
    image_caption TEXT,                         -- Keterangan Gambar
    options JSONB NOT NULL,                     -- {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_option CHAR(1) NOT NULL,            -- 'A', 'B', 'C', atau 'D'
    explanation TEXT,                           -- Pembahasan soal
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_caption TEXT;
    ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);

-- 5. TABEL STUDENT_ANSWERS (Auto-Save Per Soal Siswa)
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_doubtful BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.student_answers ALTER COLUMN student_id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.student_answers DROP CONSTRAINT IF EXISTS student_answers_student_id_fkey;
CREATE INDEX IF NOT EXISTS idx_answers_student_exam ON public.student_answers(student_id, exam_id);

-- 6. TABEL STUDENT_SUBMISSIONS (Rekapitulasi Nilai Siswa)
CREATE TABLE IF NOT EXISTS public.student_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_class TEXT DEFAULT '-',
    student_nisn TEXT DEFAULT '-',
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    violations_count INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    ALTER TABLE public.student_submissions ADD COLUMN IF NOT EXISTS student_class TEXT DEFAULT '-';
    ALTER TABLE public.student_submissions ADD COLUMN IF NOT EXISTS student_nisn TEXT DEFAULT '-';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- HAPUS SEMUA BATASAN UNIQUE PADA student_submissions
-- Sangat krusial agar 1 link ujian dapat dikerjakan bersama oleh banyak siswa dalam 1 kelas
ALTER TABLE public.student_submissions DROP CONSTRAINT IF EXISTS unique_exam_student_nisn;
ALTER TABLE public.student_submissions DROP CONSTRAINT IF EXISTS student_submissions_exam_id_student_nisn_key;
ALTER TABLE public.student_submissions DROP CONSTRAINT IF EXISTS unique_exam_student_class;
ALTER TABLE public.student_submissions DROP CONSTRAINT IF EXISTS student_submissions_exam_id_student_class_key;
ALTER TABLE public.student_submissions DROP CONSTRAINT IF EXISTS unique_exam_student;
ALTER TABLE public.student_submissions DROP CONSTRAINT IF EXISTS student_submissions_exam_id_key;
ALTER TABLE public.student_submissions DROP CONSTRAINT IF EXISTS unique_exam_submission;

CREATE INDEX IF NOT EXISTS idx_submissions_exam_id ON public.student_submissions(exam_id);

-- 7. TABEL EXAM_VIOLATIONS (Audit Log Tab-Switching)
CREATE TABLE IF NOT EXISTS public.exam_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL DEFAULT 'tab_switch',
    warning_number INTEGER NOT NULL DEFAULT 1,
    details TEXT,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.exam_violations ALTER COLUMN student_id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.exam_violations DROP CONSTRAINT IF EXISTS exam_violations_student_id_fkey;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_violations ENABLE ROW LEVEL SECURITY;

-- Buka izin akses penuh untuk seluruh operasi CBT Web
DROP POLICY IF EXISTS "Allow all exams" ON public.exams;
CREATE POLICY "Allow all exams" ON public.exams FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow all questions" ON public.questions;
CREATE POLICY "Allow all questions" ON public.questions FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow all student_answers" ON public.student_answers;
CREATE POLICY "Allow all student_answers" ON public.student_answers FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow all student_submissions" ON public.student_submissions;
CREATE POLICY "Allow all student_submissions" ON public.student_submissions FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow all exam_violations" ON public.exam_violations;
CREATE POLICY "Allow all exam_violations" ON public.exam_violations FOR ALL USING (TRUE) WITH CHECK (TRUE);
