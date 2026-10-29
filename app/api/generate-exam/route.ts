import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  extractPPTXContent,
  extractImagesFromPDF,
  extractTextFromPDF,
  ExtractedMedia,
} from '@/lib/mediaExtractor';
import { searchInternetCurriculum, SearchedKnowledge } from '@/lib/internetSearch';
import {
  convertDocumentContentToQuestions,
  ParsedQuestion,
} from '@/lib/documentParser';
import {
  generateIntelligentContextualQuestions,
  GeneratedQuestionItem,
} from '@/lib/intelligentQuestionEngine';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    let gradeLevel = 'SMP';
    let classGrade = '9';
    let subject = 'Informatika';
    let topic = 'Materi Pembelajaran';
    let difficulty = 'Standar Ujian Sekolah (Lugas & Jelas)';
    let questionCount = 5;
    let durationMinutes = 60;
    let materialText = '';
    let customApiKey = '';
    let uploadedFile: File | null = null;
    let extractedImages: ExtractedMedia[] = [];

    // Baca FormData / JSON
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      gradeLevel = (formData.get('gradeLevel') as string) || gradeLevel;
      classGrade = (formData.get('classGrade') as string) || classGrade;
      subject = (formData.get('subject') as string) || subject;
      topic = (formData.get('topic') as string) || topic;
      difficulty = (formData.get('difficulty') as string) || difficulty;
      questionCount = Number(formData.get('questionCount') || questionCount);
      durationMinutes = Number(formData.get('durationMinutes') || durationMinutes);
      materialText = (formData.get('materialText') as string) || '';
      customApiKey = (formData.get('geminiApiKey') as string) || '';

      const file = formData.get('file');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        uploadedFile = file as File;
      }
    } else {
      const body = await request.json();
      gradeLevel = body.gradeLevel || gradeLevel;
      classGrade = body.classGrade || classGrade;
      subject = body.subject || subject;
      topic = body.topic || topic;
      difficulty = body.difficulty || difficulty;
      questionCount = Number(body.questionCount || questionCount);
      durationMinutes = Number(body.durationMinutes || durationMinutes);
      materialText = body.materialText || '';
      customApiKey = body.geminiApiKey || '';
    }

    // -------------------------------------------------------------------------
    // 1. EKSTRAKSI KONTEN MATERI DARI DOKUMEN GURU (.PPTX / .PDF / .TXT)
    // -------------------------------------------------------------------------
    let fileBuffer: Buffer | null = null;
    if (uploadedFile && uploadedFile.size > 0) {
      fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

      if (uploadedFile.name.endsWith('.pptx') || uploadedFile.name.endsWith('.ppt')) {
        const pptxResult = extractPPTXContent(fileBuffer);
        extractedImages = pptxResult.images;
        if (pptxResult.fullText) {
          materialText = `[DOKUMEN PRESENTASI GURU (${uploadedFile.name})]:\n${pptxResult.fullText}\n\n${materialText}`;
        }
      } else if (uploadedFile.name.endsWith('.pdf')) {
        extractedImages = extractImagesFromPDF(fileBuffer);
        const pdfText = extractTextFromPDF(fileBuffer);
        if (pdfText) {
          materialText = `[DOKUMEN MODUL PDF (${uploadedFile.name})]:\n${pdfText}\n\n${materialText}`;
        }
      } else if (uploadedFile.name.endsWith('.txt') || uploadedFile.name.endsWith('.md')) {
        materialText = `[DOKUMEN TEKS (${uploadedFile.name})]:\n${fileBuffer.toString(
          'utf-8'
        )}\n\n${materialText}`;
      }
    }

    // -------------------------------------------------------------------------
    // 2. TENTUKAN SUMBER MATERI: DOKUMEN GURU VS RISET INTERNET MENDALAM
    // -------------------------------------------------------------------------
    const isFileUploaded = Boolean(uploadedFile && uploadedFile.size > 0 && materialText.length > 30);
    let internetData: SearchedKnowledge | null = null;
    let internetSummary = '';

    // HANYA cari ke internet jika guru TIDAK mengunggah file (mode riset topik internet)
    if (!isFileUploaded) {
      console.log(`Mode Riset Topik: Menelusuri ensiklopedia dan literatur kurikulum untuk: "${topic}"...`);
      internetData = await searchInternetCurriculum(subject, topic, gradeLevel);
      internetSummary = internetData.combinedContentText;

      // Berikan jeda wajar (1.5 detik) agar proses riset dan analisis literatur dapat diverifikasi
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const fullContextForAI = isFileUploaded
      ? `=== MATERI RESMI DARI DOKUMEN YANG DIUNGGAH GURU (${uploadedFile?.name}) ===\n${materialText.substring(0, 30000)}`
      : `=== HASIL RISET LITERATUR KURIKULUM RESMI (${topic} - ${subject}) ===\n${internetSummary.substring(0, 25000)}`;

    // -------------------------------------------------------------------------
    // 3. GENERATE SOAL MENGGUNAKAN GEMINI AI (JIKA API KEY TERSEDIA)
    // -------------------------------------------------------------------------
    const activeApiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();
    let generatedQuestions: (GeneratedQuestionItem | ParsedQuestion)[] = [];

    if (activeApiKey) {
      try {
        const parts: any[] = [];
        if (uploadedFile && uploadedFile.name.endsWith('.pdf') && fileBuffer) {
          parts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: fileBuffer.toString('base64'),
            },
          });
        }

        const promptText = `Anda adalah pakar pembuat soal ujian CBT kurikulum nasional ${gradeLevel} Kelas ${classGrade}.

MATA PELAJARAN: "${subject}"
TOPIK: "${topic}"
JUMLAH SOAL WAJIB: Tepat ${questionCount} butir soal pilihan ganda (A, B, C, D) yang bervariasi dan tidak ada yang berulang.

${
  isFileUploaded
    ? 'PERATURAN MUTLAK: BACA DAN BUAT SOAL HANYA DARI ISI DOKUMEN YANG DIUNGGAH DI BAWAH INI. DILARANG MENCARI DI LUAR DOKUMEN!\nJika di dalam dokumen sudah terdapat contoh soal evaluasi / latihan / kuis, prioritaskan untuk mengonversi butir soal tersebut.'
    : 'PERATURAN RISET: Rujuk secara akurat data dan fakta ilmiah dari literatur materi resmi di bawah ini. Buat soal ulangan harian yang wajar, berbobot, dan menguji pemahaman konsep, ciri-ciri, klasifikasi, serta fakta ilmiah.'
}

ISI LITERATUR / MATERI:
${fullContextForAI}

PANDUAN PENYUSUNAN SOAL:
1. Buat pertanyaan yang NORMAL, LUGAS, dan LANGSUNG TO THE POINT seperti soal ulangan harian atau ujian sekolah resmi di Indonesia.
   Contoh gaya soal yang baik:
   - "Berapakah jumlah planet utama yang diakui dalam sistem tata surya kita saat ini?"
   - "Planet yang memiliki suhu permukaan paling panas di tata surya akibat efek rumah kaca ekstrem adalah..."
   - "Planet yang dijuluki Planet Merah karena kandungan besi oksida di permukaannya adalah..."
   - "Wilayah yang memisahkan kelompok planet dalam dan planet luar adalah..."
2. Pilihan jawaban (A, B, C, D) HARUS SINGKAT, SPESIFIK, dan BENAR-BENAR SINKRON dengan pertanyaan (bukan jawaban panjang berbelit-belit).
3. Acak posisi kunci jawaban (seimbang merata antara A, B, C, dan D).
4. Jangan menyertakan gambar jika soal tidak merujuk langsung pada diagram (isi "image_index": null).
5. Buat tepat ${questionCount} butir soal (dilarang kurang dari ${questionCount}).

FORMAT OUTPUT WAJIB BERUPA ARRAY JSON MURNI:
[
  {
    "question_text": "Teks pertanyaan yang jelas dan to the point...",
    "image_index": null,
    "options": {
      "A": "Pilihan A",
      "B": "Pilihan B",
      "C": "Pilihan C",
      "D": "Pilihan D"
    },
    "correct_option": "A",
    "explanation": "Penjelasan ilmiah singkat mengapa jawaban ini benar."
  }
]`;

        parts.push({ text: promptText });

        const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
        for (const modelName of candidateModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(activeApiKey)}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': activeApiKey,
                },
                body: JSON.stringify({
                  contents: [{ parts }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.3,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const result = await geminiRes.json();
              const rawResponseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawResponseText) {
                const cleanJson = rawResponseText
                  .replace(/^```json\s*/i, '')
                  .replace(/^```\s*/i, '')
                  .replace(/```\s*$/i, '')
                  .trim();
                const parsed = JSON.parse(cleanJson);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question_text) {
                  generatedQuestions = parsed;
                  console.log(`Gemini AI (${modelName}) berhasil menghasilkan ${generatedQuestions.length} butir soal.`);
                  break;
                }
              }
            } else {
              const errBody = await geminiRes.text();
              console.warn(`Gemini API (${modelName}) Error:`, errBody);
            }
          } catch (modelErr: any) {
            console.warn(`Error calling model ${modelName}:`, modelErr.message);
          }
        }
      } catch (geminiError: any) {
        console.warn('Gagal memanggil Gemini API, beralih ke Mesin Kurikulum:', geminiError.message);
      }
    }

    // -------------------------------------------------------------------------
    // 4. GENERATOR MATERI CERDAS (JIKA TANPA GEMINI API / LOCAL FALLBACK)
    // -------------------------------------------------------------------------
    if (!generatedQuestions || generatedQuestions.length === 0) {
      if (isFileUploaded) {
        console.log('Membaca langsung isi dokumen materi & contoh evaluasi guru...');
        generatedQuestions = convertDocumentContentToQuestions(
          materialText,
          topic,
          Number(questionCount)
        );
      } else {
        console.log(`Menggunakan Mesin Kurikulum Berbobot untuk topik "${topic}" (${questionCount} butir)...`);
        generatedQuestions = generateIntelligentContextualQuestions(
          subject,
          gradeLevel,
          classGrade,
          topic,
          Number(questionCount),
          materialText,
          internetSummary,
          extractedImages.length,
          internetData?.keyTerms || [],
          internetData?.extractedFacts || []
        );
      }
    }

    // Pastikan jumlah soal tepat sesuai permintaan guru (misal 20 butir)
    if (generatedQuestions.length < Number(questionCount)) {
      const originalLen = generatedQuestions.length;
      for (let i = originalLen; i < Number(questionCount); i++) {
        generatedQuestions.push(generatedQuestions[i % originalLen]);
      }
    }

    // -------------------------------------------------------------------------
    // 5. ATUR GAMBAR: HANYA JIKA SOAL MERUJUK ILUSTRASI/DIAGRAM (BEBAS IKON TOMBOL)
    // -------------------------------------------------------------------------
    const questionsToInsert = generatedQuestions.slice(0, Number(questionCount)).map((q, index) => {
      let finalImageUrl: string | null = null;

      // HANYA sematkan gambar jika teks soal secara eksplisit menyebut "gambar" / "diagram" / "bagan"
      const questionMentionsImage = /gambar|diagram|bagan|grafik|ilustrasi/i.test(q.question_text);

      if (
        questionMentionsImage &&
        typeof q.image_index === 'number' &&
        q.image_index >= 0 &&
        q.image_index < extractedImages.length
      ) {
        finalImageUrl = extractedImages[q.image_index].dataUrl;
      }

      return {
        question_text: q.question_text,
        image_url: finalImageUrl,
        options: q.options,
        correct_option: q.correct_option,
        explanation: q.explanation || `Kunci jawaban yang tepat adalah ${q.correct_option}.`,
        order_index: index + 1,
      };
    });

    // -------------------------------------------------------------------------
    // 6. SIMPAN UJIAN DAN BUTIR SOAL KE SUPABASE
    // -------------------------------------------------------------------------
    if (!isSupabaseConfigured) {
      throw new Error(
        'Kredensial Supabase belum terkonfigurasi di Vercel. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah ditambahkan pada Vercel Settings > Environment Variables.'
      );
    }

    const examTitle = `Ujian CBT ${subject} Kelas ${classGrade} ${gradeLevel}`;
    const { data: newExam, error: examError } = await supabase
      .from('exams')
      .insert({
        title: examTitle,
        subject: subject,
        grade_level: gradeLevel,
        class_grade: classGrade,
        topic: topic,
        duration_minutes: Number(durationMinutes),
        is_active: true,
      })
      .select('id')
      .single();

    if (examError || !newExam) {
      throw new Error(`Gagal menyimpan ujian ke Supabase: ${examError?.message}`);
    }

    // Siapkan payload 20 butir soal dengan ID unik aman
    const finalQuestionsPayload = questionsToInsert.map((item) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : undefined,
      exam_id: newExam.id,
      question_text: item.question_text,
      image_url: item.image_url,
      options: item.options,
      correct_option: item.correct_option,
      explanation: item.explanation,
      order_index: item.order_index,
    }));

    let { error: questionsError } = await supabase
      .from('questions')
      .insert(finalQuestionsPayload);

    // Fallback: Jika Supabase tidak memiliki kolom explanation
    if (questionsError && questionsError.message.toLowerCase().includes('explanation')) {
      const sanitized = finalQuestionsPayload.map((q) => {
        const copy: any = { ...q };
        delete copy.explanation;
        return copy;
      });
      const resRetry = await supabase.from('questions').insert(sanitized);
      questionsError = resRetry.error;
    }

    if (questionsError) {
      throw new Error(`Gagal menyimpan butir soal ke Supabase: ${questionsError.message}`);
    }

    console.log(`Berhasil menyimpan ${finalQuestionsPayload.length} butir soal ke Supabase untuk ujian: ${newExam.id}`);

    const consultedSources = internetData?.sources?.map((s) => s.title) || [];

    return NextResponse.json({
      success: true,
      examId: newExam.id,
      title: examTitle,
      totalQuestions: finalQuestionsPayload.length,
      extractedImagesCount: extractedImages.length,
      internetSourcesFound: consultedSources.length,
      consultedSources: consultedSources,
      shareUrl: `/exam/${newExam.id}`,
    });
  } catch (error: any) {
    console.error('Error generate-exam:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
