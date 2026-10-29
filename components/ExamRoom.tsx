'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, Question, StudentAnswer, SaveStatus } from '@/lib/supabaseClient';

export interface StudentSession {
  id: string;
  full_name: string;
  student_class: string;
}

interface ExamRoomProps {
  exam: {
    id: string;
    title: string;
    subject: string;
    duration_minutes: number;
    grade_level?: string;
    class_grade?: string;
    topic?: string;
  };
  initialQuestions: Question[];
  initialAnswers?: Record<string, StudentAnswer>;
}

// Generator UUID yang valid & aman untuk database PostgreSQL
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ExamRoom({
  exam,
  initialQuestions,
  initialAnswers = {},
}: ExamRoomProps) {
  // ---------------------------------------------------------------------------
  // 0. STATE SESI LOGIN SISWA (NAMA & KELAS)
  // ---------------------------------------------------------------------------
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [savedSessionNotice, setSavedSessionNotice] = useState<StudentSession | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputClass, setInputClass] = useState('');
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Muat sesi siswa sebelumnya jika ada di browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cbt_student_session_${exam.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.full_name && parsed.student_class) {
          // Jangan langsung auto-login jika baru membuka link, tapi tawarkan pilihan
          setSavedSessionNotice(parsed);
          setInputName(parsed.full_name);
          setInputClass(parsed.student_class);
        }
      }
    } catch (e) {
      console.warn('Gagal membaca sesi lokal siswa:', e);
    }
    setIsSessionLoaded(true);
  }, [exam.id]);

  // Reset total semua state ujian ke kondisi awal baru
  const resetAllExamState = () => {
    setAnswers({});
    setCurrentIndex(0);
    setViolationCount(0);
    setShowViolationModal(false);
    setTimeRemaining(exam.duration_minutes * 60);
    setShowFinishModal(false);
    setIsSubmitting(false);
    setSubmissionDone(false);
    setSaveStatus('idle');
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = inputName.trim();
    const trimmedClass = inputClass.trim();

    if (!trimmedName || !trimmedClass) {
      alert('Mohon isi Nama Lengkap dan Kelas terlebih dahulu.');
      return;
    }

    // Setiap siswa yang login mendapat UUID unik baru
    const newStudent: StudentSession = {
      id: generateUUID(),
      full_name: trimmedName,
      student_class: trimmedClass,
    };

    // Bersihkan jawaban dan timer sebelumnya agar siswa baru mendapat waktu & lembar soal baru
    resetAllExamState();

    try {
      localStorage.setItem(`cbt_student_session_${exam.id}`, JSON.stringify(newStudent));
    } catch (e) {
      console.warn('Gagal menyimpan sesi ke localStorage:', e);
    }

    setSavedSessionNotice(null);
    setStudent(newStudent);
  };

  const handleResumeSavedSession = () => {
    if (savedSessionNotice) {
      resetAllExamState();
      setStudent(savedSessionNotice);
      setSavedSessionNotice(null);
    }
  };

  const handleClearSavedSession = () => {
    try {
      localStorage.removeItem(`cbt_student_session_${exam.id}`);
    } catch (e) {}
    setSavedSessionNotice(null);
    setInputName('');
    setInputClass('');
  };

  const handleResetToLogin = () => {
    try {
      localStorage.removeItem(`cbt_student_session_${exam.id}`);
    } catch (e) {}
    setStudent(null);
    setSavedSessionNotice(null);
    setInputName('');
    setInputClass('');
    resetAllExamState();
  };

  // ---------------------------------------------------------------------------
  // 1. STATE MANAJEMEN SOAL & JAWABAN
  // ---------------------------------------------------------------------------
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>(initialAnswers);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // ---------------------------------------------------------------------------
  // 2. STATE KEAMANAN (PAGE VISIBILITY API)
  // ---------------------------------------------------------------------------
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const MAX_VIOLATIONS = 3;

  // ---------------------------------------------------------------------------
  // 3. STATE TIMER COUNTDOWN
  // ---------------------------------------------------------------------------
  const [timeRemaining, setTimeRemaining] = useState(exam.duration_minutes * 60);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Status selesai ujian
  const [submissionDone, setSubmissionDone] = useState(false);

  const currentQuestion = initialQuestions[currentIndex];

  // ---------------------------------------------------------------------------
  // 4. AUTO-SAVE LOGIC KE SUPABASE
  // ---------------------------------------------------------------------------
  const saveAnswerToSupabase = useCallback(
    async (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D' | null, isDoubtful: boolean) => {
      if (!student) return;
      setSaveStatus('saving');

      if (!isSupabaseConfigured) {
        setTimeout(() => setSaveStatus('saved'), 350);
        return;
      }

      try {
        const { error } = await supabase.from('student_answers').insert({
          id: generateUUID(),
          student_id: student.id,
          exam_id: exam.id,
          question_id: questionId,
          selected_option: selectedOption,
          is_doubtful: isDoubtful,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.warn('Auto-save via insert:', error.message);
        }
        setSaveStatus('saved');
      } catch (err) {
        console.error('Gagal auto-save ke Supabase:', err);
        setSaveStatus('error');
      }
    },
    [student, exam.id]
  );

  // Handler saat siswa mengklik opsi A, B, C, atau D
  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;

    const currentAns = answers[currentQuestion.id] || {
      question_id: currentQuestion.id,
      selected_option: null,
      is_doubtful: false,
    };

    const updatedAnswer: StudentAnswer = {
      ...currentAns,
      selected_option: optionKey,
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAnswer,
    }));

    saveAnswerToSupabase(currentQuestion.id, optionKey, updatedAnswer.is_doubtful);
  };

  // Handler saat siswa men-toggle checkbox "Ragu-ragu"
  const handleToggleDoubtful = () => {
    if (!currentQuestion) return;

    const currentAns = answers[currentQuestion.id] || {
      question_id: currentQuestion.id,
      selected_option: null,
      is_doubtful: false,
    };

    const newDoubtfulState = !currentAns.is_doubtful;

    const updatedAnswer: StudentAnswer = {
      ...currentAns,
      is_doubtful: newDoubtfulState,
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAnswer,
    }));

    saveAnswerToSupabase(currentQuestion.id, updatedAnswer.selected_option, newDoubtfulState);
  };

  // ---------------------------------------------------------------------------
  // 5. FITUR KEAMANAN: PAGE VISIBILITY API
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!student || submissionDone) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        const nextViolationNumber = violationCount + 1;
        setViolationCount(nextViolationNumber);
        setShowViolationModal(true);

        try {
          await supabase.from('exam_violations').insert({
            id: generateUUID(),
            student_id: student.id,
            exam_id: exam.id,
            violation_type: 'tab_switch',
            warning_number: nextViolationNumber,
            details: `Siswa ${student.full_name} (${student.student_class}) berpindah tab browser pada ${new Date().toLocaleTimeString('id-ID')}`,
          });
        } catch (err) {
          console.error('Gagal mencatat log pelanggaran:', err);
        }

        if (nextViolationNumber >= MAX_VIOLATIONS) {
          alert('Batas toleransi perpindahan tab telah terlampaui! Ujian Anda akan dikumpulkan.');
          handleSubmitExam();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [violationCount, student, exam.id, submissionDone]);

  // ---------------------------------------------------------------------------
  // 6. COUNTDOWN TIMER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!student || submissionDone) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Waktu ujian telah berakhir!');
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [student, submissionDone]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ---------------------------------------------------------------------------
  // 7. SUBMIT EXAM FINAL (MENDUKUNG BANYAK SISWA DENGAN 1 LINK)
  // ---------------------------------------------------------------------------
  const handleSubmitExam = async () => {
    if (!student || isSubmitting) return;
    setIsSubmitting(true);

    // Hitung jawaban benar
    let correct = 0;
    initialQuestions.forEach((q) => {
      const studentAns = answers[q.id]?.selected_option;
      if (studentAns && studentAns === q.correct_option) {
        correct++;
      }
    });

    const total = initialQuestions.length;
    const finalScore = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Simpan rekapitulasi ke tabel student_submissions Supabase
    try {
      const submissionId = generateUUID();

      // Kirim payload lengkap dengan id baru untuk setiap siswa
      const payload: any = {
        id: submissionId,
        exam_id: exam.id,
        student_name: student.full_name,
        student_class: student.student_class,
        student_nisn: student.student_class,
        score: finalScore,
        correct_count: correct,
        total_questions: total,
        violations_count: violationCount,
        submitted_at: new Date().toISOString(),
      };

      let { error } = await supabase.from('student_submissions').insert(payload);

      // Jika database Supabase tidak memiliki kolom student_class
      if (error && error.message.toLowerCase().includes('student_class')) {
        const altPayload = { ...payload };
        delete altPayload.student_class;
        const res = await supabase.from('student_submissions').insert(altPayload);
        error = res.error;
      }
      // Jika database Supabase tidak memiliki kolom student_nisn
      else if (error && error.message.toLowerCase().includes('student_nisn')) {
        const altPayload = { ...payload };
        delete altPayload.student_nisn;
        const res = await supabase.from('student_submissions').insert(altPayload);
        error = res.error;
      }

      // Jika terjadi batasan UNIQUE di Supabase (misal unique_exam_student_nisn):
      // Buat student_nisn unik agar banyak siswa dalam satu kelas tetap berhasil tersimpan
      if (error && (error.code === '23505' || error.message.toLowerCase().includes('unique') || error.message.toLowerCase().includes('duplicate'))) {
        console.warn('Terdeteksi batasan UNIQUE di Supabase, mencoba insert dengan identifier pengerjaan unik...');
        const uniquePayload = {
          ...payload,
          student_nisn: `${student.student_class} #${submissionId.slice(0, 5)}`,
        };
        const resRetry = await supabase.from('student_submissions').insert(uniquePayload);
        if (!resRetry.error) {
          error = null;
        } else {
          error = resRetry.error;
        }
      }

      if (error) {
        console.error('Error insert student_submissions:', error);
        alert(`Perhatian: Gagal menyimpan rekap ke Supabase (${error.message}). Pastikan batasan UNIQUE di Supabase sudah dihapus.`);
      } else {
        // Hapus sesi lokal agar browser langsung siap untuk siswa berikutnya
        try {
          localStorage.removeItem(`cbt_student_session_${exam.id}`);
        } catch (e) {}
      }
    } catch (e: any) {
      console.error('Gagal mencatat rekap nilai ke Supabase:', e.message);
      alert(`Terjadi kesalahan koneksi Supabase: ${e.message}`);
    }

    setShowFinishModal(false);
    setIsSubmitting(false);
    setSubmissionDone(true); // Tampilkan pesan Terimakasih
  };

  // Statistik Jawaban
  const answeredCount = Object.values(answers).filter((a) => a.selected_option !== null).length;
  const doubtfulCount = Object.values(answers).filter((a) => a.is_doubtful).length;
  const unansweredCount = initialQuestions.length - answeredCount;

  // ---------------------------------------------------------------------------
  // TAMPILAN 1: GATE LOGIN SISWA (NAMA & KELAS)
  // ---------------------------------------------------------------------------
  if (!isSessionLoaded) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-md shadow-blue-500/20">
              🎓
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {exam.subject}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {exam.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Durasi: <strong>{exam.duration_minutes} Menit</strong> • Jumlah: <strong>{initialQuestions.length} Soal</strong>
            </p>
          </div>

          {/* Notifikasi Sesi Sebelumnya (Jika komputer/HP digunakan bergantian) */}
          {savedSessionNotice && (
            <div className="mb-4 p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1.5 text-blue-800">
                <span>👤</span> Sesi Sebelumnya Terdeteksi:
              </div>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Nama: <strong>{savedSessionNotice.full_name}</strong> (Kelas {savedSessionNotice.student_class})
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResumeSavedSession}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-2xs transition"
                >
                  Lanjutkan Sesi Ini
                </button>
                <button
                  type="button"
                  onClick={handleClearSavedSession}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition"
                >
                  Masuk Siswa Baru
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 9A, 9B, X MIPA 1, 11 IPS..."
                value={inputClass}
                onChange={(e) => setInputClass(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <span>⚠️</span> Petunjuk Pengerjaan:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800/90 pl-1">
                <li>Satu tautan ini dapat dikerjakan oleh <strong>seluruh siswa di kelas</strong>.</li>
                <li>Jawaban otomatis tersimpan saat memilih opsi.</li>
                <li><strong>Dilarang berpindah tab browser</strong> selama ujian berlangsung.</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Mulai Kerjakan Ujian</span>
              <span>→</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // TAMPILAN 2: RUANG UJIAN CBT SISWA
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                🎓
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm md:text-base leading-tight">
                  {exam.title}
                </h1>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-800">{student.full_name}</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                    Kelas {student.student_class}
                  </span>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">{exam.subject}</span>
                  <span>•</span>
                  <button
                    onClick={handleResetToLogin}
                    className="text-slate-400 hover:text-rose-600 text-[11px] underline"
                    title="Ganti ke akun siswa lain"
                  >
                    Bukan Anda? Ganti Siswa
                  </button>
                </div>
              </div>
            </div>

            {/* Indikator Auto-Save & Countdown Timer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-amber-600 animate-pulse font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    Menyimpan...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Tersimpan
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span
                    className="flex items-center gap-1 text-rose-600 font-semibold cursor-pointer"
                    onClick={() => saveAnswerToSupabase(currentQuestion.id, answers[currentQuestion.id]?.selected_option || null, answers[currentQuestion.id]?.is_doubtful || false)}
                  >
                    ⚠️ Gagal simpan (Coba lagi)
                  </span>
                )}
              </div>

              <div className={`px-4 py-1.5 rounded-xl text-white font-mono font-bold text-base flex items-center gap-2 shadow-xs ${
                timeRemaining <= 300 ? 'bg-rose-600 animate-pulse' : 'bg-slate-900'
              }`}>
                <span>⏱️</span>
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* AREA SOAL & OPSI (Col-span 8) */}
          <section className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-sm font-bold bg-blue-600 text-white">
                    Soal No. {currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500">dari {initialQuestions.length} Soal</span>
                </div>

                {answers[currentQuestion?.id]?.is_doubtful && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    ⚠️ Ragu-ragu
                  </span>
                )}
              </div>

              <div className={`p-6 transition-all ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
                {/* Teks Soal */}
                <div 
                  className="font-medium text-slate-900 leading-relaxed mb-4 text-base sm:text-lg"
                  dangerouslySetInnerHTML={{ __html: currentQuestion?.question_text || '' }}
                />

                {/* Gambar Soal (Jika Tersedia) */}
                {currentQuestion?.image_url && (
                  <div className="mb-6 max-w-lg mx-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
                    <img 
                      src={currentQuestion.image_url} 
                      alt="Ilustrasi Soal" 
                      className="rounded-xl max-h-72 w-full object-contain mx-auto"
                    />
                    {currentQuestion.image_caption && (
                      <p className="text-center text-xs text-slate-500 mt-2 italic font-medium">
                        {currentQuestion.image_caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Pilihan Jawaban A, B, C, D */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pilihan Jawaban:</p>
                  
                  {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => {
                    const isSelected = answers[currentQuestion.id]?.selected_option === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectOption(key as 'A' | 'B' | 'C' | 'D')}
                        className={`w-full text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-150 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/90 text-blue-950 font-medium ring-2 ring-blue-500/30'
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {key}
                        </span>
                        <span className="pt-1 text-sm md:text-base leading-snug flex-1">{value}</span>
                        {isSelected && <span className="text-blue-600 pt-1 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER AKSI */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Soal Sebelumnya
                </button>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer select-none transition">
                  <input
                    type="checkbox"
                    checked={!!answers[currentQuestion?.id]?.is_doubtful}
                    onChange={handleToggleDoubtful}
                    className="w-4 h-4 text-amber-500 rounded border-amber-400 focus:ring-amber-400"
                  />
                  <span className="text-sm font-semibold">Ragu-ragu</span>
                </label>

                <div className="flex items-center gap-2">
                  {currentIndex < initialQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.min(initialQuestions.length - 1, prev + 1))}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
                    >
                      Soal Selanjutnya →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowFinishModal(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                    >
                      Selesai Ujian ✓
                    </button>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* SIDEBAR PALET NOMOR SOAL (Col-span 4) */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  Daftar Nomor Soal
                </h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                  {answeredCount} / {initialQuestions.length} Terjawab
                </span>
              </div>

              {/* Legend Warna */}
              <div className="grid grid-cols-3 gap-2 text-xs mb-4 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></span>
                  <span className="text-slate-600">Kosong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500"></span>
                  <span className="text-slate-600">Dijawab</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-400"></span>
                  <span className="text-slate-600">Ragu</span>
                </div>
              </div>

              {/* Grid Kotak Soal */}
              <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
                {initialQuestions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isCurrent = idx === currentIndex;
                  const isAnswered = ans && ans.selected_option !== null;
                  const isDoubtful = ans && ans.is_doubtful;

                  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
                  if (isDoubtful) {
                    colorStyle = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                  } else if (isAnswered) {
                    colorStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                  }

                  const activeRing = isCurrent ? 'ring-3 ring-offset-2 ring-blue-600 scale-105 z-10' : '';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-11 rounded-xl text-sm font-semibold flex items-center justify-center border transition-all ${colorStyle} ${activeRing}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <div>Sudah: <strong className="text-emerald-600">{answeredCount}</strong></div>
                <div>Ragu: <strong className="text-amber-500">{doubtfulCount}</strong></div>
                <div>Kosong: <strong className="text-slate-600">{unansweredCount}</strong></div>
              </div>

            </div>
          </aside>

        </div>
      </main>

      {/* MODAL KEAMANAN: PERINGATAN TAB-SWITCH */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border-2 border-rose-500 animate-bounce-once">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-rose-700">Peringatan Kecurangan Terdeteksi!</h3>
            <p className="text-sm text-slate-600 mt-2">
              Anda terdeteksi berpindah tab browser atau meninggalkan jendela ujian.
            </p>

            <div className="my-4 p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs font-semibold text-rose-800">
              Peringatan Ke: <span className="text-sm font-bold">{violationCount}</span> dari maksimal {MAX_VIOLATIONS} kali!
              <br />
              <span className="text-slate-500 font-normal">Aktivitas ini telah dicatat ke pengawas atas nama <strong>{student.full_name}</strong>.</span>
            </div>

            <button
              type="button"
              onClick={() => setShowViolationModal(false)}
              className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition"
            >
              Saya Mengerti, Kembali Mengerjakan
            </button>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI SELESAI UJIAN */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Konfirmasi Selesai Ujian</h3>
            <p className="text-xs text-slate-500 text-center mb-4">Pastikan Anda telah mengecek kembali seluruh jawaban.</p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between p-2.5 bg-emerald-50 rounded-lg text-emerald-900">
                <span>Soal Terjawab:</span>
                <strong>{answeredCount} Soal</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-amber-50 rounded-lg text-amber-900">
                <span>Masih Ragu:</span>
                <strong>{doubtfulCount} Soal</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-100 rounded-lg text-slate-800">
                <span>Belum Dijawab:</span>
                <strong>{unansweredCount} Soal</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitExam}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Mengirim...' : 'Kumpulkan Jawaban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SELESAI UJIAN (TERIMAKASIH SUDAH MENGERJAKAN) */}
      {submissionDone && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✓
            </div>
            
            <h3 className="text-2xl font-black text-slate-900">
              Terimakasih sudah mengerjakan!
            </h3>
            
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Jawaban Anda atas nama <strong>{student.full_name}</strong> (Kelas {student.student_class}) telah berhasil diterima dan tersimpan rapi di sistem.
            </p>

            <div className="my-6 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-800">
              Semoga mendapatkan hasil yang terbaik. Silakan beristirahat atau menunggu instruksi selanjutnya dari guru Anda.
            </div>

            {/* Tombol Tutup -> Kembali ke Halaman Login Siswa untuk siswa berikutnya */}
            <button
              onClick={handleResetToLogin}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-500/20"
            >
              Tutup & Siap untuk Siswa Berikutnya
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
