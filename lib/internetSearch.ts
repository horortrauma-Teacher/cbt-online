/**
 * Modul Riset Literatur Kurikulum & Ensiklopedia Edukasi Real-time
 * Melakukan penelusuran mendalam ke berbagai ensiklopedia akademik dan sumber pendidikan tepercaya.
 * Mengambil artikel lengkap (bukan hanya ringkasan singkat) untuk menyusun soal ujian berkualitas tinggi.
 */

export interface CurriculumTopicInfo {
  title: string;
  url: string;
  snippet: string;
  extract: string;
  sections?: string[];
}

export interface SearchedKnowledge {
  topic: string;
  subject: string;
  gradeLevel: string;
  sources: CurriculumTopicInfo[];
  combinedContentText: string;
  keyTerms: string[];
  extractedFacts: string[];
}

/**
 * Membersihkan string HTML dan tag formatting dari teks
 */
function cleanHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ekstraksi istilah penting (keyword) ilmiah/akademik dari teks materi
 */
function extractKeyTerms(text: string): string[] {
  const termsSet = new Set<string>();

  // Tangkap istilah dalam tanda kurung atau kutip, misal (Computational Thinking), "Dekomposisi"
  const bracketMatches = text.match(/\(([^)]{3,40})\)|"([^"]{3,40})"/g);
  if (bracketMatches) {
    bracketMatches.forEach((m) => {
      const clean = m.replace(/[()"]/g, '').trim();
      if (clean.length > 2 && !clean.includes('http') && !clean.includes('hlm') && !clean.includes('ISBN')) {
        termsSet.add(clean);
      }
    });
  }

  // Tangkap kata kunci dengan huruf kapital di awal (Proper Nouns / Istilah Khusus)
  const capitalizedMatches = text.match(/\b[A-Z][a-z]{3,}(?:\s+[A-Z][a-z]{3,})*\b/g);
  if (capitalizedMatches) {
    capitalizedMatches.forEach((term) => {
      if (
        ![
          'Dalam', 'Pada', 'Untuk', 'Dengan', 'Secara', 'Materi', 'Siswa',
          'Ujian', 'Adalah', 'Menurut', 'Kelas', 'Tahun', 'Daftar', 'Bagian',
          'Selain', 'Namun', 'Karena', 'Sebuah', 'Sebagai', 'Antara'
        ].includes(term) &&
        term.length > 3
      ) {
        termsSet.add(term);
      }
    });
  }

  return Array.from(termsSet).slice(0, 25);
}

/**
 * Ekstraksi fakta-fakta spesifik dan kalimat definisi dari teks literatur
 */
function extractFacts(text: string, subject: string = ''): string[] {
  const sentences = text
    .split(/[.!?]+\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 250);

  const facts: string[] = [];

  for (const sentence of sentences) {
    // Abaikan kalimat biografi tokoh atau sejarah kekhalifahan jika bukan pelajaran Sejarah/Agama
    const isBiography =
      /\b(khalifah|abbasiyah|dinasti|kerajaan|masehi|hijriyah|makam|wafat|lahir pada|berkebangsaan|polimat|filsuf|sejarawan|mutawakkil|al-rashid)\b/i.test(
        sentence
      );
    if (isBiography && !subject.toLowerCase().includes('sejarah') && !subject.toLowerCase().includes('agama')) {
      continue;
    }

    // Cari kalimat yang mengandung pola definisi, karakteristik, atau fakta penting
    const isFact =
      /\b(adalah|merupakan|yaitu|terdiri atas|terbagi menjadi|berfungsi untuk|memiliki ciri|ditemukan oleh|terbesar|terkecil|terjauh|terdekat|terpanas|pertama kali|disebabkan oleh)\b/i.test(
        sentence
      );

    if (isFact && !sentence.includes('==') && !sentence.includes('http')) {
      facts.push(sentence);
      if (facts.length >= 25) break;
    }
  }

  return facts;
}

/**
 * Cari materi pelajaran di Ensiklopedia Bahasa Indonesia & Literatur Kurikulum secara mendalam
 */
export async function searchInternetCurriculum(
  subject: string,
  topic: string,
  gradeLevel: string = 'SMP'
): Promise<SearchedKnowledge> {
  // Bersihkan nama topik dari embel-embel file (misal: "BAB 1 ... .pptx" -> "Berpikir Komputasional")
  const cleanTopic = topic
    .replace(/BAB\s*\d+\s*:?/gi, '')
    .replace(/\.(pptx|pdf|docx|txt|ppt)/gi, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Susun berbagai kueri pencarian akademis untuk mendapatkan cakupan literatur yang lengkap
  const queryCandidates = [
    cleanTopic,
    `${cleanTopic} ${subject}`,
    `${cleanTopic} karakteristik klasifikasi`,
    `${cleanTopic} planet orbit` // untuk topik astronomi
  ];

  const sources: CurriculumTopicInfo[] = [];
  const fetchedTitles = new Set<string>();

  for (const query of queryCandidates) {
    if (!query || query.length < 3) continue;

    try {
      // 1. Search Wikipedia API untuk mencari artikel edukasi terkait
      const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&utf8=1&srlimit=5`;

      const searchRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'CBTOnlineCurriculumResearchBot/3.0 (edutech-cbt@sekolah.id)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!searchRes.ok) continue;

      const searchData = await searchRes.json();
      const searchHits = searchData?.query?.search || [];

      // Filter artikel yang relevan dan belum pernah diambil
      const newHits = searchHits.filter(
        (hit: any) =>
          !fetchedTitles.has(hit.title) &&
          !hit.title.includes('Daftar') &&
          !hit.title.includes('Kategori:') &&
          !hit.title.includes('Berkas:')
      );

      if (newHits.length > 0) {
        // Ambil hingga 3 artikel teratas dari kueri ini
        const selectedHits = newHits.slice(0, 3);
        const titlesToFetch = selectedHits.map((h: any) => h.title);
        titlesToFetch.forEach((t: string) => fetchedTitles.add(t));

        // 2. Fetch full extracts (teks materi lengkap) TANPA exintro agar seluruh isi bab terambil
        const titlesParam = titlesToFetch.join('|');
        const extractUrl = `https://id.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(
          titlesParam
        )}&format=json&utf8=1`;

        const extractRes = await fetch(extractUrl, {
          headers: {
            'User-Agent': 'CBTOnlineCurriculumResearchBot/3.0 (edutech-cbt@sekolah.id)',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(6000),
        });

        if (extractRes.ok) {
          const extractData = await extractRes.json();
          const pages = extractData?.query?.pages || {};

          for (const pageId in pages) {
            const page = pages[pageId];
            if (page && page.extract && page.extract.length > 100) {
              const matchedHit = searchHits.find((h: any) => h.title === page.title);

              // Bersihkan teks ekstraksi dari karakter aneh
              const cleanExtract = page.extract
                .replace(/\n{3,}/g, '\n\n')
                .trim();

              sources.push({
                title: page.title,
                url: `https://id.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/\s+/g, '_'))}`,
                snippet: cleanHtml(matchedHit?.snippet || ''),
                extract: cleanExtract.substring(0, 8000), // Simpan hingga 8000 karakter per artikel
              });
            }
          }
        }
      }

      // Jika sudah mengumpulkan minimal 4 sumber literatur berbobot, cukup
      if (sources.length >= 4) {
        break;
      }
    } catch (err: any) {
      console.warn(`Pencarian literatur internet untuk "${query}" tidak dapat diakses:`, err.message);
    }
  }

  // Gabungkan semua teks penjelasan dari berbagai sumber literatur akademik
  let combinedContentText = sources
    .map((s) => `[SUMBER LITERATUR RESMI: ${s.title}]\n${s.extract}`)
    .join('\n\n==================================================\n\n');

  // Fallback cadangan jika koneksi offline/terbatas
  if (!combinedContentText) {
    combinedContentText = `Topik Pembelajaran Kurikulum Nasional: "${cleanTopic}" untuk mata pelajaran ${subject} jenjang ${gradeLevel}. Konsep mencakup definisi ilmiah esensial, klasifikasi komponen/unsur, prinsip kerja dan hukum alam, karakteristik khusus, serta implementasi pemecahan masalah kontekstual.`;
  }

  const keyTerms = extractKeyTerms(combinedContentText);
  const extractedFacts = extractFacts(combinedContentText, subject);

  return {
    topic: cleanTopic,
    subject,
    gradeLevel,
    sources,
    combinedContentText,
    keyTerms,
    extractedFacts,
  };
}
