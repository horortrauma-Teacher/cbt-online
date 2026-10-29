import React from 'react';
import ResultsDashboardView from '@/components/ResultsDashboardView';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ResultsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ExamResultsDashboard({ params }: ResultsPageProps) {
  const resolvedParams = await params;
  const examId = resolvedParams.id;

  // 1. Ambil detail Ujian
  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, subject, grade_level, class_grade, topic')
    .eq('id', examId)
    .single();

  // 2. Ambil Rekapitulasi Nilai Siswa
  const { data: submissions } = await supabase
    .from('student_submissions')
    .select('*')
    .eq('exam_id', examId)
    .order('score', { ascending: false });

  return (
    <ResultsDashboardView
      examId={examId}
      exam={exam}
      initialSubmissions={submissions || []}
    />
  );
}
