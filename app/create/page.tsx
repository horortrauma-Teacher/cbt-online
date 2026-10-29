'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CreateExamPage() {
  const [gradeLevel, setGradeLevel] = useState<'SMP' | 'SMA'>('SMP');
  const [classGrade, setClassGrade] = useState('9');
  const [subject, setSubject] = useState('Informatika');
  const [topic, setTopic] = useState('Berpikir Komputasional');
  const [difficulty, setDifficulty] = useState('Standar Ujian Sekolah (Lugas & Jelas)');
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Sumber Materi (Topik Teks vs Upload Dokumen)
  const [sourceMode, setSourceMode] = useState<'topic' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialNotes, setMaterialNotes] = useState('');

  // API Key Gemini (Opsional, disimpan di localStorage)
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyField, setShowApiKeyField] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [researchStep, setResearchStep] = useState(0);

  const [generatedResult, setGeneratedResult] = useState<{
    examId: string;
    title: string;
    totalQuestions: number;
    extractedImagesCount?: number;
    internetSourcesFound?: number;
    consultedSources?: string[];
    shareUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const researchSteps = [
    '🔍 Menghubungi ensiklopedia kurikulum & basis data edukasi tepercaya...',
    '📚 Mengumpulkan & memvalidasi literatur ilmiah untuk topik materi...',
    '🔬 Menganalisis konsep esensial, klasifikasi, dan karakteristik materi...',
    '✍️ Menyusun dan memvalidasi butir soal pilihan ganda standar ujian...',
    '💾 Memvalidasi kunci jawaban dan menyimpan paket soal ke Supabase...',
  ];

  // Efek animasi tahapan riset saat loading
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setResearchStep(0);
      timer = setInterval(() => {
        setResearchStep((prev) => (prev < researchSteps.length - 1 ? prev + 1 : prev));
      }, 750);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  // Load API Key dari localStorage saat mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('cbt_gemini_api_key');
      if (savedKey) {
        setGeminiApiKey(savedKey);
        setShowApiKeyField(true);
      }
    } catch (e) {}
  }, []);

  // Daftar Mapel per Jenjang
  const subjectsMap = {
    SMP: [
      'Informatika',
      'Matematika',
      'Ilmu Pengetahuan Alam (IPA)',
      'Ilmu Pengetahuan Sosial (IPS)',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Pendidikan Pancasila (PPKn)',
      'Pendidikan Agama Islam (PAI)',
      'Seni Budaya',
    ],
    SMA: [
      'Informatika',
      'Matematika Wajib',
      'Matematika Tingkat Lanjut',
      'Fisika',
      'Kimia',
      'Biologi',
      'Ekonomi',
      'Sosiologi',
      'Geografi',
      'Sejarah Indonesia',
      'Bahasa Indonesia',
      'Bahasa Inggris',
    ],
  };

  const handleGradeLevelChange = (level: 'SMP' | 'SMA') => {
    setGradeLevel(level);
    setClassGrade(level === 'SMP' ? '9' : '11');
    setSubject(subjectsMap[level][0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Bersihkan nama file untuk dijadikan topik pembelajaran
      const cleanFileName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/BAB\s*\d+\s*:?/gi, '')
        .replace(/[-_]/g, ' ')
        .trim();
      setTopic(cleanFileName || file.name);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedResult(null);

    // Simpan API key jika diinput
    if (geminiApiKey) {
      try {
        localStorage.setItem('cbt_gemini_api_key', geminiApiKey.trim());
      } catch (e) {}
    }

    try {
      const formData = new FormData();
      formData.append('gradeLevel', gradeLevel);
      formData.append('classGrade', classGrade);
      formData.append('subject', subject);
      formData.append('topic', topic);
      formData.append('difficulty', difficulty);
      formData.append('questionCount', String(questionCount));
      formData.append('durationMinutes', String(durationMinutes));
      formData.append('materialText', materialNotes);
      formData.append('geminiApiKey', geminiApiKey.trim());

      if (sourceMode === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal men-generate soal');
      }

      setGeneratedResult(data);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!generatedResult) return;
    const fullUrl = `${window.location.origin}${generatedResult.shareUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-xs uppercase tracking-wider">
                AI CBT Studio 2.0
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Penyusun Soal Cerdas SMP & SMA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Pembuat Ujian & Generator Soal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Riset literatur kurikulum internet mendalam atau baca langsung dokumen modul materi guru.
            </p>
          </div>
          <Link
            href="/"
            className="self-start md:self-auto px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition"
          >
            ← Kembali ke Beranda
          </Link>
        </div>

        {/* Tab Pemilihan Mode Sumber */}
        <div className="flex items-center gap-2 mb-6 p-1.5 bg-slate-200/70 rounded-2xl max-w-md">
          <button
            type="button"
            onClick={() => setSourceMode('file')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              sourceMode === 'file'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📑</span>
            <span>Upload PDF / PPTX Materi</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceMode('topic')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              sourceMode === 'topic'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌐</span>
            <span>Riset Internet via Topik</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORM GENERATOR (Col 7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Jenjang Pendidikan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Jenjang Pendidikan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGradeLevelChange('SMP')}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      gradeLevel === 'SMP'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>🎒</span> SMP / MTs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGradeLevelChange('SMA')}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      gradeLevel === 'SMA'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>🏛️</span> SMA / MA / SMK
                  </button>
                </div>
              </div>

              {/* Tingkat Kelas & Mapel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {gradeLevel === 'SMP' ? (
                      <>
                        <option value="7">Kelas 7 SMP</option>
                        <option value="8">Kelas 8 SMP</option>
                        <option value="9">Kelas 9 SMP</option>
                      </>
                    ) : (
                      <>
                        <option value="10">Kelas 10 SMA</option>
                        <option value="11">Kelas 11 SMA</option>
                        <option value="12">Kelas 12 SMA</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {subjectsMap[gradeLevel].map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* INPUT SUMBER MATERI */}
              {sourceMode === 'file' ? (
                /* 1. Mode Upload File */
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Upload Dokumen Materi Guru (.PPTX / .PDF / .TXT)
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">Bebas Internet</span>
                  </div>
                  <input
                    type="file"
                    accept=".pptx,.ppt,.pdf,.txt,.md"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
                      <span className="font-semibold truncate">📄 {selectedFile.name}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      AI membaca seluruh isi slide presentasi & contoh evaluasi kuis guru dari file.
                    </p>
                  )}
                </div>
              ) : (
                /* 2. Mode Riset Internet via Topik */
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Topik / Materi Pembelajaran (AI Riset Mendalam ke Internet)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Tata Surya, Sistem Komputer, Ekosistem..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    🌐 AI menelusuri literatur kurikulum resmi, karakteristik ilmiah, klasifikasi, dan fakta terverifikasi di ensiklopedia akademik.
                  </p>
                </div>
              )}

              {/* Jumlah Soal, Gaya Soal & Durasi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Soal</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white font-semibold text-blue-700"
                  >
                    <option value="5">5 Butir</option>
                    <option value="10">10 Butir</option>
                    <option value="15">15 Butir</option>
                    <option value="20">20 Butir (Lengkap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gaya Soal</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
                  >
                    <option value="Standar Ujian Sekolah (Lugas & Jelas)">Standar Ulangan / PAS</option>
                    <option value="Contoh Penerapan Sehari-hari">Penerapan Sehari-hari</option>
                    <option value="Definisi & Pemahaman Konsep">Definisi Konsep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
                  >
                    <option value="30">30 Menit</option>
                    <option value="60">60 Menit</option>
                    <option value="90">90 Menit</option>
                    <option value="120">120 Menit</option>
                  </select>
                </div>
              </div>

              {/* PENGATURAN API KEY GEMINI (OPSIONAL) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowApiKeyField(!showApiKeyField)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <span>{showApiKeyField ? '▼' : '▶'}</span>
                  <span>Akses Google Gemini AI & Riset Real-time (Opsional)</span>
                </button>

                {showApiKeyField && (
                  <div className="mt-2 p-3 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-800">
                        Google Gemini API Key
                      </label>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                        ✓ Terkonfigurasi di .env Server
                      </span>
                    </div>
                    <input
                      type="password"
                      placeholder="Tersimpan di .env server (Opsional jika ingin menimpa)"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      💡 <em>API Key telah aktif di server:</em> AI akan otomatis menggunakan Gemini AI untuk meriset materi mendalam, menganalisis kurikulum, dan merumuskan butir-butir soal CBT berkualitas tinggi.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>
                      {sourceMode === 'file'
                        ? '📄 Membaca dokumen & contoh evaluasi...'
                        : '🌐 Meriset literatur kurikulum & menyusun soal...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>
                      {sourceMode === 'file'
                        ? 'Generate Soal Langsung dari Dokumen Materi'
                        : `Generate ${questionCount} Soal dari Riset Topik Internet`}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* HASIL GENERATE & PROGRESS (Col 5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {isLoading ? (
              /* PROGRES RISET INTERNET MULTI-STEP */
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-200 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold animate-spin">
                    ⚙️
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Sedang Melakukan Riset Mendalam...
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold">
                      Topik: &quot;{topic}&quot; ({questionCount} Butir Soal)
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  {researchSteps.map((stepText, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded-xl transition ${
                        idx === researchStep
                          ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                          : idx < researchStep
                          ? 'text-emerald-700 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="text-xs">
                        {idx < researchStep ? '✅' : idx === researchStep ? '⏳' : '⚪'}
                      </span>
                      <span className="text-[11px] leading-relaxed">{stepText}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : generatedResult ? (
              /* KARTU SUKSES HASIL GENERATE */
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm text-emerald-950 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-2xl mb-3">
                  🎉
                </div>
                <h3 className="text-lg font-bold text-emerald-900 leading-snug">
                  Soal Berhasil Di-generate!
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Soal telah disesuaikan dengan kurikulum materi, bebas dari format template baku, dan tersimpan di Supabase.
                </p>

                <div className="my-4 p-3 bg-white/80 rounded-2xl border border-emerald-200 text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Judul Ujian:</span>
                    <strong className="text-slate-900">{generatedResult.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumlah Soal:</span>
                    <strong className="text-emerald-800">{generatedResult.totalQuestions} Butir Soal</strong>
                  </div>
                  {Boolean(generatedResult.internetSourcesFound && generatedResult.internetSourcesFound > 0) && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Riset Literatur:</span>
                      <strong className="text-blue-600">✓ {generatedResult.internetSourcesFound} Ensiklopedia Terverifikasi</strong>
                    </div>
                  )}
                  {Boolean(generatedResult.extractedImagesCount && generatedResult.extractedImagesCount > 0) && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gambar Materi:</span>
                      <strong>{generatedResult.extractedImagesCount} Gambar Terdeteksi</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exam ID:</span>
                    <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">{generatedResult.examId}</code>
                  </div>

                  {/* Sumber yang Dikonsultasikan */}
                  {generatedResult.consultedSources && generatedResult.consultedSources.length > 0 && (
                    <div className="pt-2 border-t border-emerald-200">
                      <span className="text-[10px] font-bold text-slate-600 block mb-1">
                        📚 Referensi Literatur Kurikulum:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {generatedResult.consultedSources.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-emerald-100/90 text-emerald-900 rounded-md text-[10px] font-medium"
                          >
                            ✓ {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={copyShareLink}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>{copied ? '✅' : '🔗'}</span>
                    <span>{copied ? 'Tautan Disalin ke Clipboard!' : 'Salin Tautan Ujian untuk Siswa'}</span>
                  </button>

                  <Link
                    href={`/exam/${generatedResult.examId}/edit`}
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>✏️</span>
                    <span>Edit / Kustomisasi Butir Soal</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={generatedResult.shareUrl}
                      target="_blank"
                      className="py-2.5 px-3 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 font-semibold text-xs rounded-xl text-center transition"
                    >
                      Buka Tes Siswa ↗
                    </Link>
                    <Link
                      href={`/exam/${generatedResult.examId}/results`}
                      className="py-2.5 px-3 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 font-semibold text-xs rounded-xl text-center transition"
                    >
                      Rekap Nilai Siswa 📊
                    </Link>
                  </div>

                  <Link
                    href="/"
                    className="block w-full py-2 bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-900 font-bold text-xs rounded-xl text-center transition mt-1"
                  >
                    🏠 Selesai & Kembali ke Daftar Ujian
                  </Link>
                </div>
              </div>
            ) : (
              /* KARTU PANDUAN AWAL */
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 text-slate-500 text-xs space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>🚀</span> Peningkatan AI CBT Studio 2.0
                </h3>
                <ul className="space-y-2 text-slate-600 leading-relaxed">
                  <li>
                    <strong>🌐 Riset Literatur Ilmiah Real-Time:</strong> AI menelusuri artikel kurikulum resmi di ensiklopedia akademik untuk menggali konsep, definisi, dan karakteristik materi secara lengkap.
                  </li>
                  <li>
                    <strong>📑 Ekstraksi Penuh Slide (.pptx):</strong> Tidak hanya gambar, seluruh teks isi slide presentasi guru dibaca per-slide untuk dijadikan materi soal.
                  </li>
                  <li>
                    <strong>🧠 Anti-Template & Bebas Halu:</strong> Menghilangkan pola kalimat baku yang monoton. Pertanyaan normal, lugas, dan pilihan jawaban (A, B, C, D) 100% sinkron dan relevan.
                  </li>
                </ul>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
