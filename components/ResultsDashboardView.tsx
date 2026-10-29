'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Submission {
  id: string;
  student_name: string;
  student_class: string;
  score: number;
  correct_count: number;
  total_questions: number;
  violations_count: number;
  submitted_at: string;
}

interface ResultsDashboardViewProps {
  examId: string;
  exam: {
    id: string;
    title: string;
    subject: string;
    grade_level?: string;
    class_grade?: string;
    topic?: string;
  } | null;
  initialSubmissions: Submission[];
}

export default function ResultsDashboardView({
  examId,
  exam,
  initialSubmissions,
}: ResultsDashboardViewProps) {
  // POIN 3: Proteksi Password Admin ("cbt2026")
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Data Submissions Real-time
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Periksa sessionStorage saat mount
  useEffect(() => {
    try {
      const isAuth = sessionStorage.getItem('cbt_admin_authed');
      if (isAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.warn('SessionStorage error:', e);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'cbt2026') {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('cbt_admin_authed', 'true');
    } else {
      setAuthError('Password salah! Masukkan password admin yang benar.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('cbt_admin_authed');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const refreshSubmissions = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('exam_id', examId)
        .order('score', { ascending: false });

      if (data && !error) {
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Gagal refresh data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper untuk membersihkan penamaan kelas (jika terdapat suffix ID unik)
  const getCleanClass = (st: any) => {
    const raw = (st.student_class && st.student_class !== '-') ? st.student_class : (st.student_nisn || '-');
    return String(raw).replace(/\s*#[a-zA-Z0-9]+$/, '').trim();
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((s: any) => {
    const matchName = (s.student_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const cleanClass = getCleanClass(s);
    const matchClass = filterClass === 'ALL' || cleanClass === filterClass;
    return matchName && matchClass;
  });

  const availableClasses = Array.from(new Set(submissions.map(getCleanClass).filter((c) => c && c !== '-')));
  const totalStudents = submissions.length;
  const averageScore = totalStudents > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + Number(curr.score), 0) / totalStudents)
    : 0;
  const highestScore = totalStudents > 0
    ? Math.max(...submissions.map((s) => Number(s.score)))
    : 0;

  // ---------------------------------------------------------------------------
  // TAMPILAN 1: GATE PASSWORD ADMIN ("cbt2026")
  // ---------------------------------------------------------------------------
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            🔒
          </div>
          <h1 className="text-2xl font-black text-slate-900">Akses Terproteksi Pengawas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi nilai dan audit kecurangan siswa hanya dapat diakses oleh guru atau pengawas ujian.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-left mb-1.5">
                Password Admin
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan password admin..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {authError && (
                <p className="text-rose-600 text-xs font-semibold mt-1.5 text-left">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-md shadow-slate-900/20 text-sm"
            >
              Buka Rekapitulasi Nilai →
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600">← Kembali ke Beranda</Link>
            <span>Password default: <code>cbt2026</code></span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // TAMPILAN 2: DASHBOARD REKAPITULASI NILAI GURU / ADMIN
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Dashboard Pengawas & Rekap Nilai
              </span>
              <span className="text-xs text-slate-500">• {exam?.subject || 'CBT Online'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {exam?.title || 'Rekapitulasi Hasil Ujian'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Materi: {exam?.topic || '-'} | ID Ujian: <code className="bg-slate-200 px-1 py-0.5 rounded">{examId}</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshSubmissions}
              disabled={isRefreshing}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <span>{isRefreshing ? '🔄' : '⚡'}</span>
              <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
            </button>
            <Link
              href={`/exam/${examId}/edit`}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              ✏️ Edit Soal
            </Link>
            <button
              onClick={handleAdminLogout}
              className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-xl transition"
            >
              Keluar Admin
            </button>
          </div>
        </div>

        {/* Ringkasan Statistik Kelas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Peserta Selesai</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalStudents} Siswa</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Rata-rata Nilai Kelas</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{averageScore} / 100</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nilai Tertinggi</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{highestScore} / 100</div>
          </div>
        </div>

        {/* Filter & Pencarian Siswa */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Filter Kelas:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="p-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="ALL">Semua Kelas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABEL REKAPITULASI NILAI SISWA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Daftar Hasil Pengerjaan Siswa</h2>
            <span className="text-xs text-slate-500">{filteredSubmissions.length} Data Ditampilkan</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Jawaban Benar</th>
                  <th className="py-3 px-4">Nilai Akhir</th>
                  <th className="py-3 px-4">Pelanggaran Tab</th>
                  <th className="py-3 px-4">Waktu Kumpul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((st, idx) => (
                    <tr key={st.id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{st.student_name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-xs border border-blue-100">
                          Kelas {getCleanClass(st)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {st.correct_count} / {st.total_questions}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${
                          Number(st.score) >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : Number(st.score) >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {st.score}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {st.violations_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            ⚠️ {st.violations_count}x Tab Pindah
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">✓ Tertib</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(st.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                      Belum ada siswa yang menyelesaikan ujian ini.<br />
                      Bagikan tautan ujian ke siswa untuk mulai merekap nilai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
