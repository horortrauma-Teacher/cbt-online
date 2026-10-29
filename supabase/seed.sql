-- ============================================================================
-- SEED DATA & DUMMY DATA UNTUK PENGUJIAN CBT SUPABASE
-- Jalankan query ini di SQL Editor Supabase setelah menjalankan schema.sql
-- ============================================================================

-- 1. Bersihkan data lama jika ada (Opsional)
-- TRUNCATE TABLE public.student_answers, public.questions, public.exams, public.profiles CASCADE;

-- 2. Buat Dummy Akun Guru & Siswa di Profiles
-- Catatan: Jika ingin mendaftar manual via Supabase Auth, Anda bisa lewati bagian ini
INSERT INTO public.profiles (id, email, full_name, role, nisn)
VALUES 
  ('f87a31b2-9df5-430c-8067-ff2b61ef9099', 'siswa@cbt.com', 'Ahmad Rizky Pratama', 'siswa', '0081293847'),
  ('a11b22c3-44d5-66e7-88f9-001122334455', 'guru@cbt.com', 'Bambang Sudarsono, S.Kom', 'guru', NULL)
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name;

-- 3. Masukkan Data Ujian Contoh
INSERT INTO public.exams (id, created_by, title, subject, duration_minutes, is_active)
VALUES (
  'e7b14050-424a-4416-833e-e6ec8d8cb56d',
  'a11b22c3-44d5-66e7-88f9-001122334455',
  'Penilaian Akhir Semester (PAS) 2026',
  'Informatika SMP',
  90,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 4. Masukkan Bank Soal Pilihan Ganda (10 Soal)
INSERT INTO public.questions (exam_id, question_text, image_url, image_caption, options, correct_option, order_index)
VALUES 
(
  'e7b14050-424a-4416-833e-e6ec8d8cb56d',
  'Perangkat keras (hardware) komputer yang berfungsi sebagai otak utama pemroses seluruh data instruksi adalah...',
  NULL,
  NULL,
  '{"A": "Hard Disk Drive (HDD)", "B": "Central Processing Unit (CPU)", "C": "Random Access Memory (RAM)", "D": "Power Supply Unit (PSU)"}'::jsonb,
  'B',
  1
),
(
  'e7b14050-424a-4416-833e-e6ec8d8cb56d',
  'Perhatikan gambar di bawah ini! Topologi jaringan komputer yang menghubungkan seluruh node ke satu titik konsentrator (switch/hub) disebut...',
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
  'Ilustrasi Perangkat Jaringan Komputer & Kabel Data',
  '{"A": "Topologi Bus", "B": "Topologi Ring", "C": "Topologi Star", "D": "Topologi Mesh"}'::jsonb,
  'C',
  2
),
(
  'e7b14050-424a-4416-833e-e6ec8d8cb56d',
  'Urutan langkah-langkah logis dan terstruktur yang disusun untuk menyelesaikan suatu masalah komputasi dinamakan...',
  NULL,
  NULL,
  '{"A": "Algoritma", "B": "Variabel", "C": "Pseudocode", "D": "Kompilator"}'::jsonb,
  'A',
  3
),
(
  'e7b14050-424a-4416-833e-e6ec8d8cb56d',
  'Protokol keamanan komunikasi web yang ditandai dengan enkripsi SSL/TLS pada browser sehingga pertukaran data lebih aman adalah...',
  NULL,
  NULL,
  '{"A": "HTTP", "B": "FTP", "C": "HTTPS", "D": "SMTP"}'::jsonb,
  'C',
  4
),
(
  'e7b14050-424a-4416-833e-e6ec8d8cb56d',
  'Dalam berpikir komputasional, proses memecah masalah yang rumit menjadi bagian-bagian yang lebih kecil dan mudah dikelola disebut...',
  NULL,
  NULL,
  '{"A": "Abstraksi", "B": "Dekomposisi", "C": "Pengenalan Pola", "D": "Algoritma"}'::jsonb,
  'B',
  5
);

-- ============================================================================
-- Kebijakan Akses Tambahan untuk Mode Pengembangan (Dev / Anon Access)
-- Memungkinkan Next.js membaca soal dan menguji auto-save sebelum auth login dipasang
-- ============================================================================
CREATE POLICY "Allow anon read active exams" 
  ON public.exams FOR SELECT 
  TO anon 
  USING (is_active = TRUE);

CREATE POLICY "Allow anon read questions" 
  ON public.questions FOR SELECT 
  TO anon 
  USING (TRUE);

CREATE POLICY "Allow anon upsert student answers" 
  ON public.student_answers FOR ALL 
  TO anon 
  USING (TRUE) 
  WITH CHECK (TRUE);

CREATE POLICY "Allow anon insert violations" 
  ON public.exam_violations FOR INSERT 
  TO anon 
  WITH CHECK (TRUE);
