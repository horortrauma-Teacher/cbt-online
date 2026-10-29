import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let exams: any[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('exams')
        .select('id, title, subject, grade_level, class_grade, topic, duration_minutes, created_at')
        .order('created_at', { ascending: false })
        .limit(15);
      if (data) exams = data;
    } catch (e) {
      console.warn('Gagal load exams:', e);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-start py-10 px-4 sm:px-6 font-sans text-slate-800">
      
      {/* KARTU UTAMA HERO */}
      <div className="max-w-3xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200 text-center mb-8">
        
        {/* Logo Badge */}
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-md shadow-blue-500/20 font-bold">
          ✨
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          <span>AI-Powered CBT Engine</span>
          <span>•</span>
          <span>SMP & SMA Kurikulum Nasional</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Platform CBT Online Otomatis
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
          Buat soal ujian otomatis dari topik atau upload file (.pdf/.pptx), bagikan tautannya ke siswa, dan pantau rekapitulasi nilai secara real-time.
        </p>

        {/* 4 Langkah Alur Sistem */}
        <div className="my-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-blue-600 font-extrabold text-sm">01. Generate</span>
            <p className="text-xs text-slate-600 mt-1">Upload modul / prompt AI menyusun butir soal.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-emerald-600 font-extrabold text-sm">02. Edit & Cek</span>
            <p className="text-xs text-slate-600 mt-1">Kustomisasi soal, kunci jawaban, dan gambar.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-amber-600 font-extrabold text-sm">03. Share Link</span>
            <p className="text-xs text-slate-600 mt-1">Kirim link ke siswa (wajib login nama & kelas).</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-purple-600 font-extrabold text-sm">04. Rekap DB</span>
            <p className="text-xs text-slate-600 mt-1">Nilai & audit tab tersimpan aman di Supabase.</p>
          </div>
        </div>

        {/* Tombol Buat Ujian Baru */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/create"
            className="w-full sm:w-auto py-3.5 px-7 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 text-sm"
          >
            <span>+</span>
            <span>Buat Ujian Baru dengan AI</span>
          </Link>
        </div>

      </div>

      {/* DAFTAR UJIAN YANG TELAH DIBUAT (TIDAK PERNAH HILANG DARI SUPABASE) */}
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>📚</span> Daftar Ujian Tersimpan
            </h2>
            <p className="text-xs text-slate-500">
              Seluruh ujian yang pernah dibuat tersimpan permanen di Supabase Anda.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
            {exams.length} Ujian Aktif
          </span>
        </div>

        <div className="space-y-3">
          {exams.length > 0 ? (
            exams.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                      {ex.subject}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Kelas {ex.class_grade} ({ex.grade_level})
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      ⏱️ {ex.duration_minutes} Menit
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {ex.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {ex.topic || 'Topik Umum'}
                  </p>
                </div>

                {/* Tombol Aksi Langsung untuk Guru */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/exam/${ex.id}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                    title="Buka Lembar Ujian Siswa"
                  >
                    🔗 Link Siswa
                  </Link>

                  <Link
                    href={`/exam/${ex.id}/edit`}
                    className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold transition"
                    title="Edit Soal dan Kunci Jawaban"
                  >
                    ✏️ Edit Soal
                  </Link>

                  <Link
                    href={`/exam/${ex.id}/results`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
                    title="Lihat Hasil Pengerjaan Siswa"
                  >
                    📊 Rekap Nilai
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
              Belum ada ujian yang dibuat. Klik tombol <strong>"Buat Ujian Baru dengan AI"</strong> di atas untuk memulai.
            </div>
          )}
        </div>
      </div>

    </main>
  );
}
