import React from 'react';
import ExamRoom from '@/components/ExamRoom';
import { supabase, isSupabaseConfigured, Question } from '@/lib/supabaseClient';

// Pastikan halaman selalu dinamis dan tidak di-cache oleh Next.js server
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ExamPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const resolvedParams = await params;
  const examId = resolvedParams.id;

  let examData = null;
  let questionsData: any[] | null = null;

  // Ambil data ujian & bank soal dari Supabase
  if (isSupabaseConfigured) {
    try {
      const examRes = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examRes.data) {
        examData = examRes.data;
      }

      // Gunakan select('*') agar aman dari ketidaksesuaian kolom di database Supabase
      const qRes = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId);

      if (qRes.data && qRes.data.length > 0) {
        // Urutkan nomor soal sesuai order_index
        questionsData = qRes.data.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
      } else if (qRes.error) {
        console.warn('Gagal memuat butir soal:', qRes.error.message);
      }
    } catch (e: any) {
      console.warn('Gagal memuat data ujian dari Supabase:', e.message);
    }
  }

  // Fallback data jika belum tersimpan di Supabase
  const exam = examData || {
    id: examId,
    title: 'Penilaian Akhir Semester (PAS) 2026',
    subject: 'Informatika SMP',
    grade_level: 'SMP',
    class_grade: '9',
    topic: 'Materi Pembelajaran CBT',
    duration_minutes: 90,
  };

  const questions: Question[] = questionsData && questionsData.length > 0 ? (questionsData as Question[]) : [
    {
      id: 'q-1',
      exam_id: examId,
      question_text: 'Perangkat keras (hardware) komputer yang bertugas sebagai pemroses utama seluruh data adalah...',
      image_url: null,
      image_caption: null,
      options: {
        A: 'Random Access Memory (RAM)',
        B: 'Central Processing Unit (CPU)',
        C: 'Solid State Drive (SSD)',
        D: 'Motherboard',
      },
      correct_option: 'B',
      order_index: 1,
    },
    {
      id: 'q-2',
      exam_id: examId,
      question_text: 'Komponen jaringan yang berfungsi menghubungkan beberapa jaringan komputer yang berbeda dan mengatur rute lalu lintas data adalah...',
      image_url: null,
      image_caption: null,
      options: {
        A: 'Router',
        B: 'Hub',
        C: 'Modem',
        D: 'Repeater',
      },
      correct_option: 'A',
      order_index: 2,
    },
    {
      id: 'q-3',
      exam_id: examId,
      question_text: 'Dalam berpikir komputasional, proses menyaring dan membuang detail yang tidak penting agar fokus pada informasi esensial disebut...',
      image_url: null,
      image_caption: null,
      options: {
        A: 'Dekomposisi (Decomposition)',
        B: 'Abstraksi (Abstraction)',
        C: 'Pengenalan Pola (Pattern Recognition)',
        D: 'Algoritma (Algorithm Design)',
      },
      correct_option: 'B',
      order_index: 3,
    },
  ];

  return (
    <ExamRoom
      exam={exam}
      initialQuestions={questions}
    />
  );
}
