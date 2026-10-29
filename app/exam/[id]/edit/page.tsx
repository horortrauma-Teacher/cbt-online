'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface EditableQuestion {
  id?: string;
  question_text: string;
  image_url: string;
  image_caption: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  order_index: number;
}

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  // Proteksi Password Admin ("cbt2026")
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // State Form Ujian & Soal
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [examTitle, setExamTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [topic, setTopic] = useState('');

  const [questions, setQuestions] = useState<EditableQuestion[]>([]);

  // Periksa autentikasi admin di sessionStorage
  useEffect(() => {
    try {
      if (sessionStorage.getItem('cbt_admin_authed') === 'true') {
        setIsAdminAuthed(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Muat data ujian dan butir soal dari Supabase
  useEffect(() => {
    if (!examId) return;

    async function loadExamData() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data: examData } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .single();

          if (examData) {
            setExamTitle(examData.title || '');
            setSubject(examData.subject || '');
            setDurationMinutes(examData.duration_minutes || 90);
            setTopic(examData.topic || '');
          }

          const { data: questionsData } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('order_index', { ascending: true });

          if (questionsData && questionsData.length > 0) {
            setQuestions(
              questionsData.map((q, idx) => ({
                id: q.id,
                question_text: q.question_text || '',
                image_url: q.image_url || '',
                image_caption: q.image_caption || '',
                options: q.options || { A: '', B: '', C: '', D: '' },
                correct_option: q.correct_option || 'A',
                explanation: q.explanation || '',
                order_index: idx + 1,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Gagal memuat soal:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadExamData();
  }, [examId]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'cbt2026') {
      setIsAdminAuthed(true);
      sessionStorage.setItem('cbt_admin_authed', 'true');
      setAuthError('');
    } else {
      setAuthError('Password salah! Masukkan password admin.');
    }
  };

  // ---------------------------------------------------------------------------
  // MANIPULASI BUTIR SOAL
  // ---------------------------------------------------------------------------
  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpdateOption = (qIndex: number, optKey: 'A' | 'B' | 'C' | 'D', value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options = { ...updated[qIndex].options, [optKey]: value };
      return updated;
    });
  };

  const handleImageFileUpload = (qIndex: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleUpdateQuestion(qIndex, 'image_url', result);
        handleUpdateQuestion(qIndex, 'image_caption', `Gambar: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (qIndex: number) => {
    handleUpdateQuestion(qIndex, 'image_url', '');
    handleUpdateQuestion(qIndex, 'image_caption', '');
  };

  const handleAddQuestion = () => {
    const newQ: EditableQuestion = {
      question_text: '',
      image_url: '',
      image_caption: '',
      options: { A: '', B: '', C: '', D: '' },
      correct_option: 'A',
      explanation: '',
      order_index: questions.length + 1,
    };
    setQuestions([...questions, newQ]);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Soal No. ${index + 1}?`)) {
      setQuestions((prev) => {
        const filtered = prev.filter((_, idx) => idx !== index);
        return filtered.map((q, idx) => ({ ...q, order_index: idx + 1 }));
      });
    }
  };

  // ---------------------------------------------------------------------------
  // SIMPAN PERUBAHAN KE SUPABASE & BUKA MODAL AKSI
  // ---------------------------------------------------------------------------
  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase belum dikonfigurasi di file .env.local');
      }

      // 1. Update Tabel Exams
      const { error: examError } = await supabase
        .from('exams')
        .update({
          title: examTitle,
          subject: subject,
          duration_minutes: Number(durationMinutes),
          topic: topic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', examId);

      if (examError) throw examError;

      // 2. Hapus Soal Lama & Masukkan Soal Baru yang Sudah Diedit
      await supabase.from('questions').delete().eq('exam_id', examId);

      const formattedQuestions = questions.map((q, idx) => ({
        exam_id: examId,
        question_text: q.question_text,
        image_url: q.image_url ? q.image_url.trim() : null,
        image_caption: q.image_caption ? q.image_caption.trim() : null,
        options: q.options,
        correct_option: q.correct_option,
        explanation: q.explanation || `Kunci jawaban yang tepat adalah opsi ${q.correct_option}.`,
        order_index: idx + 1,
      }));

      let { error: insertError } = await supabase.from('questions').insert(formattedQuestions);

      // Fallback jika database Supabase belum memiliki kolom explanation atau image_caption
      if (insertError) {
        console.warn('Percobaan pertama simpan soal gagal, mencoba format kompatibel:', insertError.message);
        const fallbackQuestions = formattedQuestions.map((q) => ({
          exam_id: q.exam_id,
          question_text: q.question_text,
          image_url: q.image_url,
          options: q.options,
          correct_option: q.correct_option,
          order_index: q.order_index,
        }));
        const retryRes = await supabase.from('questions').insert(fallbackQuestions);
        insertError = retryRes.error;
      }

      if (insertError) throw insertError;

      // Munculkan Modal Sukses dengan opsi navigasi yang jelas
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(`Gagal menyimpan ke Supabase: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = () => {
    const fullUrl = `${window.location.origin}/exam/${examId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // GATE LOGIN ADMIN
  if (!isAdminAuthed) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✏️
          </div>
          <h1 className="text-2xl font-black text-slate-900">Akses Editor Soal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hanya guru pembuat soal yang diizinkan untuk mengedit butir soal dan kunci jawaban.
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
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
              />
              {authError && (
                <p className="text-rose-600 text-xs font-semibold mt-1.5 text-left">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition shadow-md shadow-amber-500/20 text-sm"
            >
              Masuk ke Editor Soal →
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
            Password: <code>cbt2026</code>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* NAVIGASI ATAS / BREADCRUMB AGAR GURU MUDAH KEMBALI */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-600 font-medium">🏠 Beranda</Link>
            <span>/</span>
            <Link href={`/exam/${examId}/results`} className="hover:text-blue-600 font-medium">📋 Dashboard Rekap</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">✏️ Edit Soal</span>
          </div>

          <Link
            href={`/exam/${examId}/results`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <span>←</span>
            <span>Kembali ke Dashboard Ujian</span>
          </Link>
        </div>

        {/* Header Editor */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  Studio Editor Guru
                </span>
                <span className="text-xs text-slate-500">• ID: {examId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Edit & Kustomisasi Soal CBT
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/exam/${examId}`}
                target="_blank"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Pratinjau Siswa ↗
              </Link>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                {isSaving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
            </div>
          </div>

          {/* Form Metadata Ujian */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Ujian</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Durasi (Menit)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* DAFTAR BUTIR SOAL */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 relative">
              
              {/* Header Kartu Soal */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold">
                  Soal Nomor {idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(idx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>🗑️</span> Hapus Soal
                </button>
              </div>

              {/* Teks Pertanyaan */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teks Soal / Pertanyaan
                </label>
                <textarea
                  rows={3}
                  value={q.question_text}
                  onChange={(e) => handleUpdateQuestion(idx, 'question_text', e.target.value)}
                  placeholder="Tuliskan pertanyaan di sini..."
                  className="w-full p-3 text-sm rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Upload & Kelola Gambar Asli Soal */}
              <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🖼️</span> Gambar Soal (Hanya jika dibutuhkan)
                  </span>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`file-upload-q-${idx}`}
                      className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>📁</span>
                      <span>Upload Gambar dari Komputer</span>
                    </label>
                    <input
                      id={`file-upload-q-${idx}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(idx, e.target.files?.[0])}
                    />

                    {q.image_url && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                      >
                        <span>🗑️</span>
                        <span>Hapus Gambar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Keterangan Gambar (Caption)
                    </label>
                    <input
                      type="text"
                      value={q.image_caption}
                      onChange={(e) => handleUpdateQuestion(idx, 'image_caption', e.target.value)}
                      placeholder="Contoh: Diagram Organ Pernapasan / Slide 4"
                      className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Atau URL Gambar Eksternal
                    </label>
                    <input
                      type="text"
                      value={q.image_url.startsWith('data:') ? '[Gambar File Terupload]' : q.image_url}
                      onChange={(e) => handleUpdateQuestion(idx, 'image_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {q.image_url && (
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block mb-1">Pratinjau Gambar Soal:</span>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block max-w-md">
                      <img
                        src={q.image_url}
                        alt="Pratinjau Gambar Soal"
                        className="max-h-48 rounded-lg object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Opsi Pilihan Ganda (A, B, C, D) & Pemilihan Kunci Jawaban */}
              <div className="space-y-3 mb-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilihan Ganda & Kunci Jawaban (Klik lingkaran huruf untuk menentukan kunci)
                </label>

                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const isCorrect = q.correct_option === key;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border transition ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdateQuestion(idx, 'correct_option', key)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition flex-shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Klik untuk jadikan kunci jawaban"
                      >
                        {key}
                      </button>

                      <input
                        type="text"
                        value={q.options[key] || ''}
                        onChange={(e) => handleUpdateOption(idx, key, e.target.value)}
                        placeholder={`Teks Pilihan ${key}...`}
                        className="w-full text-xs sm:text-sm bg-transparent border-0 focus:ring-0 p-1 font-medium"
                      />

                      {isCorrect && (
                        <span className="text-emerald-700 text-xs font-bold px-2 py-0.5 bg-emerald-100 rounded-md flex-shrink-0">
                          Kunci Benar ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pembahasan Soal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pembahasan / Penjelasan Soal (Opsional)
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                  placeholder="Mengapa jawaban tersebut benar..."
                  className="w-full p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

            </div>
          ))}
        </div>

        {/* Tombol Bawah: Tambah Soal, Kembali, & Simpan */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/exam/${examId}/results`}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
            >
              ← Kembali ke Dashboard
            </Link>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Tambah Soal</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full sm:w-auto py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isSaving ? 'Menyimpan ke Database...' : '💾 Simpan Seluruh Perubahan'}
          </button>
        </div>

      </div>

      {/* =====================================================================
          MODAL SUKSES SIMPAN: OPSI NAVIGASI LENGKAP & SHARE LINK
          ===================================================================== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 text-center shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✓
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Soal Berhasil Disimpan!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Seluruh perubahan butir soal dan kunci jawaban telah tersimpan permanen di database Supabase.
            </p>

            {/* Kotak Tautan Siswa */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tautan Ujian untuk Siswa:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/exam/${examId}` : `/exam/${examId}`}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-700 font-mono select-all"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex-shrink-0"
                >
                  {copied ? 'Tersalin! ✓' : 'Salin'}
                </button>
              </div>
            </div>

            {/* Tombol Aksi Navigasi */}
            <div className="space-y-2">
              <Link
                href={`/exam/${examId}/results`}
                className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-blue-500/20"
              >
                📊 Selesai & Buka Dashboard Rekap Nilai Siswa
              </Link>
              
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/exam/${examId}`}
                  target="_blank"
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  👀 Pratinjau Siswa ↗
                </Link>
                <Link
                  href="/"
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  🏠 Ke Halaman Utama
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Tetap di Halaman Editor Ini
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
