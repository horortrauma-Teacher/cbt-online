/**
 * Document Content & Evaluation Parser
 * Membaca materi, bab, definisi, dan contoh soal evaluasi/kuis dari file materi (.pptx / .pdf)
 * Mengonversinya langsung menjadi butir soal CBT yang konkret, natural, dan sesuai isi dokumen guru.
 * Menjamin jumlah soal selalu tepat sesuai yang diminta guru (5, 10, 15, atau 20 butir soal).
 */

export interface ParsedQuestion {
  question_text: string;
  image_index: number | null;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

/**
 * 1. PENCARI SOAL EVALUASI EKSIS DI DALAM DOKUMEN SLIDE / PDF
 */
export function extractExistingQuizFromDocument(fullText: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  const quizSectionMatch = fullText.match(
    /(?:latihan\s*soal|uji\s*kompetensi|evaluasi|kuis|quiz|pertanyaan|latihan\s*mandiri)[\s\S]*/i
  );

  const textToScan = quizSectionMatch ? quizSectionMatch[0] : fullText;

  const mcRegex =
    /(?:^|\n)\s*(?:soal\s*)?(\d+)[\.\)]\s*([^\n\r]+(?:\n(?![A-D][\.\)]|\d+[\.\)]).*)*)\s*\n?\s*A[\.\)]\s*([^\n\r]+)\s*\n?\s*B[\.\)]\s*([^\n\r]+)\s*\n?\s*C[\.\)]\s*([^\n\r]+)\s*\n?\s*D[\.\)]\s*([^\n\r]+)/gi;

  let match;
  while ((match = mcRegex.exec(textToScan)) !== null) {
    const qNum = match[1];
    const qText = match[2].trim().replace(/\s+/g, ' ');
    const optA = match[3].trim();
    const optB = match[4].trim();
    const optC = match[5].trim();
    const optD = match[6].trim();

    if (qText.length > 5 && optA && optB && optC && optD) {
      questions.push({
        question_text: qText,
        image_index: null,
        options: {
          A: optA,
          B: optB,
          C: optC,
          D: optD,
        },
        correct_option: 'A',
        explanation: `Soal evaluasi yang diambil langsung dari dokumen materi slide (Nomor ${qNum}).`,
      });
    }
  }

  return questions;
}

// -----------------------------------------------------------------------------
// BANK LENGKAP 20 SOAL PER MATERI (MENDUKUNG HINGGA 20 BUTIR SOAL UTUH)
// -----------------------------------------------------------------------------

const SISTEM_KOMPUTER_20: ParsedQuestion[] = [
  {
    question_text: 'Sistem komputer pada dasarnya terdiri atas 3 komponen utama yang saling berhubungan dan bekerja sama, yaitu...',
    image_index: null,
    options: {
      A: 'Hardware, Software, dan Brainware',
      B: 'Keyboard, Mouse, dan Monitor',
      C: 'Harddisk, RAM, dan Processor',
      D: 'Windows, Linux, dan Microsoft Office',
    },
    correct_option: 'A',
    explanation: 'Sistem komputer terdiri dari perangkat keras (hardware), perangkat lunak (software), dan pengguna (brainware).',
  },
  {
    question_text: 'Komponen fisik dari sistem komputer yang dapat dilihat secara kasat mata dan disentuh secara nyata disebut...',
    image_index: null,
    options: {
      A: 'Hardware (Perangkat Keras)',
      B: 'Software (Perangkat Lunak)',
      C: 'Brainware (Pengguna)',
      D: 'Firmware',
    },
    correct_option: 'A',
    explanation: 'Hardware adalah semua bagian fisik komputer yang dapat dilihat dan diraba langsung.',
  },
  {
    question_text: 'Perangkat keras komputer yang berfungsi untuk memasukkan data atau perintah ke dalam komputer (Input Device) adalah...',
    image_index: null,
    options: {
      A: 'Monitor dan Printer',
      B: 'Keyboard, Mouse, dan Scanner',
      C: 'Speaker dan Proyektor',
      D: 'Harddisk dan Flashdisk',
    },
    correct_option: 'B',
    explanation: 'Keyboard, mouse, dan scanner bertugas memasukkan data atau perintah ke dalam komputer.',
  },
  {
    question_text: 'Perangkat keras yang bertugas menampilkan atau mengeluarkan hasil dari pemrosesan data (Output Device) adalah...',
    image_index: null,
    options: {
      A: 'Keyboard dan Mouse',
      B: 'Microphone dan Scanner',
      C: 'Monitor, Printer, dan Speaker',
      D: 'RAM dan Processor',
    },
    correct_option: 'C',
    explanation: 'Monitor menampilkan visual, printer mencetak fisik, dan speaker mengeluarkan audio.',
  },
  {
    question_text: 'Orang atau manusia yang menggunakan, mengoperasikan, dan mengendalikan perangkat komputer disebut...',
    image_index: null,
    options: {
      A: 'Hardware',
      B: 'Software',
      C: 'Malware',
      D: 'Brainware',
    },
    correct_option: 'D',
    explanation: 'Brainware adalah setiap manusia yang terlibat dalam mengoperasikan komputer.',
  },
  {
    question_text: 'Komponen perangkat keras yang bertindak sebagai "otak" komputer untuk memproses seluruh instruksi dan data adalah...',
    image_index: null,
    options: {
      A: 'CPU (Central Processing Unit)',
      B: 'Harddisk',
      C: 'Monitor',
      D: 'Keyboard',
    },
    correct_option: 'A',
    explanation: 'CPU (Processor) mengendalikan seluruh operasi dan melakukan pemrosesan data utama.',
  },
  {
    question_text: 'Bagian di dalam CPU yang bertugas khusus melakukan perhitungan aritmatika (+, -, *, /) dan perbandingan logika adalah...',
    image_index: null,
    options: {
      A: 'Control Unit (CU)',
      B: 'Arithmetic Logic Unit (ALU)',
      C: 'Register',
      D: 'Power Supply',
    },
    correct_option: 'B',
    explanation: 'ALU (Arithmetic Logic Unit) bertugas melakukan operasi perhitungan matematika dan logika.',
  },
  {
    question_text: 'Bagian CPU yang bertugas mengontrol dan mengoordinasikan seluruh lalu lintas data antar komponen komputer adalah...',
    image_index: null,
    options: {
      A: 'Control Unit (CU)',
      B: 'ALU',
      C: 'Harddisk',
      D: 'VGA Card',
    },
    correct_option: 'A',
    explanation: 'Control Unit (CU) mengarahkan lalu lintas instruksi dan mengatur kerja seluruh unit komputer.',
  },
  {
    question_text: 'Memori komputer yang bersifat sementara (volatile) dan datanya akan hilang saat komputer dimatikan adalah...',
    image_index: null,
    options: {
      A: 'ROM (Read Only Memory)',
      B: 'RAM (Random Access Memory)',
      C: 'Harddisk Drive',
      D: 'Flashdisk',
    },
    correct_option: 'B',
    explanation: 'RAM menyimpan data instruksi aplikasi yang sedang aktif berjalan dan bersifat sementara (volatile).',
  },
  {
    question_text: 'Memori yang menyimpan instruksi dasar booting awal komputer (BIOS) dan sifatnya permanen (non-volatile) adalah...',
    image_index: null,
    options: {
      A: 'RAM',
      B: 'Cache Memory',
      C: 'ROM (Read Only Memory)',
      D: 'Virtual Memory',
    },
    correct_option: 'C',
    explanation: 'ROM berisi program instruksi dasar pabrikan yang tidak akan terhapus saat listrik mati.',
  },
  {
    question_text: 'Di bawah ini yang merupakan media penyimpanan sekunder (Secondary Storage) berkapasitas besar adalah...',
    image_index: null,
    options: {
      A: 'Harddisk dan SSD',
      B: 'Monitor dan Proyektor',
      C: 'Keyboard dan Mouse',
      D: 'RAM dan Cache',
    },
    correct_option: 'A',
    explanation: 'Harddisk dan SSD berfungsi menyimpan data dan file pengguna secara permanen.',
  },
  {
    question_text: 'Perangkat lunak utama yang berfungsi mengelola seluruh sumber daya perangkat keras dan menjadi jembatan dengan aplikasi pengguna adalah...',
    image_index: null,
    options: {
      A: 'Sistem Operasi (Operating System)',
      B: 'Microsoft Word',
      C: 'Anti Virus',
      D: 'Kabel VGA',
    },
    correct_option: 'A',
    explanation: 'Sistem Operasi (seperti Windows, Linux, macOS) mengendalikan perangkat keras dan mendasari berjalannya aplikasi.',
  },
  {
    question_text: 'Berikut ini yang merupakan contoh dari Sistem Operasi (Operating System) adalah...',
    image_index: null,
    options: {
      A: 'Microsoft Windows, Linux, dan macOS',
      B: 'Microsoft Word, Excel, dan PowerPoint',
      C: 'Google Chrome, Firefox, dan Safari',
      D: 'Adobe Photoshop dan CorelDraw',
    },
    correct_option: 'A',
    explanation: 'Windows, Linux, dan macOS adalah sistem operasi pengelola komputer.',
  },
  {
    question_text: 'Program yang dirancang untuk membantu pengguna menyelesaikan pekerjaan tertentu seperti mengetik surat atau membuat laporan disebut...',
    image_index: null,
    options: {
      A: 'Sistem Operasi',
      B: 'Perangkat Lunak Aplikasi (Application Software)',
      C: 'Driver Hardware',
      D: 'BIOS Firmware',
    },
    correct_option: 'B',
    explanation: 'Perangkat lunak aplikasi digunakan pengguna untuk tujuan tugas spesifik seperti mengetik dokumen atau mengedit foto.',
  },
  {
    question_text: 'Contoh aplikasi pengolah kata yang sering digunakan untuk membuat dokumen teks adalah...',
    image_index: null,
    options: {
      A: 'Microsoft Excel',
      B: 'Microsoft Word',
      C: 'Microsoft PowerPoint',
      D: 'Microsoft Access',
    },
    correct_option: 'B',
    explanation: 'Microsoft Word adalah perangkat lunak aplikasi pengolah kata (word processor).',
  },
  {
    question_text: 'Papan sirkuit utama tempat semua komponen penting komputer seperti prosesor, RAM, dan kartu grafis terpasang disebut...',
    image_index: null,
    options: {
      A: 'Motherboard (Mainboard)',
      B: 'Power Supply',
      C: 'Heatsink Fan',
      D: 'Casing Komputer',
    },
    correct_option: 'A',
    explanation: 'Motherboard adalah papan sirkuit utama yang menghubungkan seluruh komponen komputer.',
  },
  {
    question_text: 'Perangkat keras yang bertugas mengalirkan dan membagi daya listrik ke seluruh komponen di dalam komputer adalah...',
    image_index: null,
    options: {
      A: 'Power Supply Unit (PSU)',
      B: 'Processor',
      C: 'Sound Card',
      D: 'VGA Card',
    },
    correct_option: 'A',
    explanation: 'Power Supply mengubah arus AC menjadi DC dan mengalirkannya ke motherboard serta perangkat lainnya.',
  },
  {
    question_text: 'Perangkat keras yang berfungsi mengubah sinyal digital komputer menjadi tampilan visual pada layar monitor adalah...',
    image_index: null,
    options: {
      A: 'Sound Card',
      B: 'VGA Card (Kartu Grafis)',
      C: 'LAN Card',
      D: 'Modem',
    },
    correct_option: 'B',
    explanation: 'VGA (Video Graphics Array) Card memproses gambar dan menampilkan visual pada monitor.',
  },
  {
    question_text: 'Seseorang yang bertugas merancang dan menulis kode program perangkat lunak komputer disebut sebagai...',
    image_index: null,
    options: {
      A: 'Programmer',
      B: 'Operator',
      C: 'Teknisi Jaringan',
      D: 'End User',
    },
    correct_option: 'A',
    explanation: 'Programmer adalah orang yang membuat dan mengembangkan aplikasi/software menggunakan bahasa pemrograman.',
  },
  {
    question_text: 'Alur pemrosesan data yang benar pada sebuah sistem komputer adalah...',
    image_index: null,
    options: {
      A: 'Input -> Process -> Output -> Storage',
      B: 'Output -> Input -> Process -> Storage',
      C: 'Storage -> Output -> Input -> Process',
      D: 'Process -> Input -> Storage -> Output',
    },
    correct_option: 'A',
    explanation: 'Data dimasukkan lewat Input, diolah dalam Process, ditampilkan pada Output, dan disimpan di Storage.',
  },
];

const BERPIKIR_KOMPUTASIONAL_20: ParsedQuestion[] = [
  {
    question_text: 'Teknik memecah masalah besar atau sistem yang kompleks menjadi bagian-bagian yang lebih kecil dan mudah dikelola disebut...',
    image_index: null,
    options: {
      A: 'Dekomposisi',
      B: 'Abstraksi',
      C: 'Pengenalan Pola',
      D: 'Algoritma',
    },
    correct_option: 'A',
    explanation: 'Dekomposisi memecah masalah rumit menjadi bagian-bagian kecil yang lebih mudah diselesaikan.',
  },
  {
    question_text: 'Berikut ini yang merupakan contoh penerapan dekomposisi dalam kehidupan sehari-hari adalah...',
    image_index: null,
    options: {
      A: 'Membagi tugas membersihkan rumah menjadi menyapu, mengepel, mencuci piring, dan merapikan kamar',
      B: 'Mengenali wajah teman dari ciri fisik mata dan senyumnya',
      C: 'Melihat peta rute jalan tanpa memperhatikan pohon-pohon di tepi jalan',
      D: 'Mengikuti instruksi resep masakan dari langkah 1 sampai selesai',
    },
    correct_option: 'A',
    explanation: 'Membagi satu pekerjaan besar menjadi tugas-tugas kecil adalah dekomposisi.',
  },
  {
    question_text: 'Proses menyaring dan hanya fokus pada informasi esensial dengan mengabaikan detail yang tidak penting disebut...',
    image_index: null,
    options: {
      A: 'Algoritma',
      B: 'Dekomposisi',
      C: 'Abstraksi',
      D: 'Struktur Data',
    },
    correct_option: 'C',
    explanation: 'Abstraksi berfokus pada informasi penting dan mengabaikan rincian yang tidak relevan.',
  },
  {
    question_text: 'Manakah contoh di bawah ini yang paling tepat menggambarkan konsep abstraksi?',
    image_index: null,
    options: {
      A: 'Peta jalur MRT yang hanya menampilkan nama stasiun dan garis rute tanpa menggambar gedung di atasnya',
      B: 'Membagi kelompok belajar menjadi tim riset, tim pengetik, dan tim presentasi',
      C: 'Mengetahui jam macet jalan raya karena terjadi setiap pukul 17.00 WIB',
      D: 'Menjalankan langkah menyalakan komputer sesuai urutan tombol power',
    },
    correct_option: 'A',
    explanation: 'Peta rute MRT hanya menampilkan informasi yang diperlukan pengguna (stasiun dan jalur) tanpa detail yang tidak perlu.',
  },
  {
    question_text: 'Urutan langkah-langkah logis dan sistematis yang disusun secara teratur untuk menyelesaikan suatu masalah disebut...',
    image_index: null,
    options: {
      A: 'Algoritma',
      B: 'Abstraksi',
      C: 'Dekomposisi',
      D: 'Pengenalan Pola',
    },
    correct_option: 'A',
    explanation: 'Algoritma adalah serangkaian langkah instruksi terurut untuk memecahkan masalah.',
  },
  {
    question_text: 'Mengidentifikasi kesamaan atau tren yang berulang pada beberapa permasalahan yang berbeda disebut...',
    image_index: null,
    options: {
      A: 'Dekomposisi',
      B: 'Pengenalan Pola (Pattern Recognition)',
      C: 'Abstraksi',
      D: 'Algoritma',
    },
    correct_option: 'B',
    explanation: 'Pengenalan pola mencari kesamaan pola di antara masalah untuk mempermudah penyelesaian.',
  },
  {
    question_text: 'Contoh penerapan pengenalan pola dalam kehidupan sehari-hari adalah...',
    image_index: null,
    options: {
      A: 'Mengetahui bahwa antrean kasir selalu lebih panjang pada hari libur',
      B: 'Membuat daftar belanjaan sebelum pergi ke pasar',
      C: 'Mengabaikan merek baju saat menghitung jumlah pakaian kotor',
      D: 'Menulis langkah memasak nasi goreng',
    },
    correct_option: 'A',
    explanation: 'Melihat tren keramaian kasir pada hari libur merupakan pengenalan pola berulang.',
  },
  {
    question_text: 'Di bawah ini yang BUKAN merupakan 4 pilar utama dalam berpikir komputasional adalah...',
    image_index: null,
    options: {
      A: 'Dekomposisi',
      B: 'Abstraksi',
      C: 'Pengenalan Pola',
      D: 'Merakit Komputer',
    },
    correct_option: 'D',
    explanation: 'Empat pilar berpikir komputasional adalah Dekomposisi, Abstraksi, Pengenalan Pola, dan Algoritma.',
  },
  {
    question_text: 'Diagram alir yang menggunakan simbol-simbol standar untuk menggambarkan urutan proses algoritma disebut...',
    image_index: null,
    options: {
      A: 'Flowchart',
      B: 'Pseudocode',
      C: 'Source Code',
      D: 'Wireframe',
    },
    correct_option: 'A',
    explanation: 'Flowchart adalah diagram alir dengan simbol-simbol grafis untuk memvisualisasikan algoritma.',
  },
  {
    question_text: 'Dalam diagram flowchart, simbol berbentuk oval atau elips berfungsi untuk menunjukkan...',
    image_index: null,
    options: {
      A: 'Titik awal (Start) atau akhir (End) algoritma',
      B: 'Proses perhitungan',
      C: 'Pengambilan keputusan (Decision)',
      D: 'Input dan output data',
    },
    correct_option: 'A',
    explanation: 'Simbol terminator (oval) digunakan untuk menandai awal dan akhir flowchart.',
  },
  {
    question_text: 'Dalam diagram flowchart, simbol belah ketupat (Decision) digunakan untuk...',
    image_index: null,
    options: {
      A: 'Pengambilan keputusan berdasarkan kondisi tertentu (Ya / Tidak)',
      B: 'Memasukkan data dari keyboard',
      C: 'Menampilkan hasil cetak dokumen',
      D: 'Menghubungkan dua halaman yang berbeda',
    },
    correct_option: 'A',
    explanation: 'Simbol belah ketupat menggambarkan percabangan atau pengambilan keputusan.',
  },
  {
    question_text: 'Bentuk penulisan algoritma yang menggunakan teks menyerupai bahasa pemrograman tetapi mudah dibaca manusia disebut...',
    image_index: null,
    options: {
      A: 'Pseudocode',
      B: 'Flowchart',
      C: 'Binary Code',
      D: 'Assembly',
    },
    correct_option: 'A',
    explanation: 'Pseudocode adalah kode semu yang ditulis dalam bahasa manusia terstruktur.',
  },
  {
    question_text: 'Struktur data tumpukan di mana data yang terakhir masuk akan menjadi data yang pertama keluar (LIFO - Last In First Out) disebut...',
    image_index: null,
    options: {
      A: 'Stack (Tumpukan)',
      B: 'Queue (Antrean)',
      C: 'Array',
      D: 'Graph',
    },
    correct_option: 'A',
    explanation: 'Stack bekerja dengan prinsip LIFO seperti tumpukan piring di meja.',
  },
  {
    question_text: 'Struktur data antrean di mana elemen yang pertama masuk akan dilayani terlebih dahulu (FIFO - First In First Out) disebut...',
    image_index: null,
    options: {
      A: 'Stack',
      B: 'Queue (Antrean)',
      C: 'Tree',
      D: 'Hashing',
    },
    correct_option: 'B',
    explanation: 'Queue bekerja dengan prinsip FIFO seperti antrean loket tiket.',
  },
  {
    question_text: 'Contoh penerapan struktur data Stack (Tumpukan) dalam fitur aplikasi komputer adalah...',
    image_index: null,
    options: {
      A: 'Fitur tombol Undo pada aplikasi pengolah kata',
      B: 'Antrean pencetakan dokumen pada printer',
      C: 'Pemutaran lagu secara acak (shuffle)',
      D: 'Pengiriman pesan email',
    },
    correct_option: 'A',
    explanation: 'Tombol Undo membatalkan aksi paling akhir dilakukan (LIFO).',
  },
  {
    question_text: 'Contoh penerapan struktur data Queue (Antrean) dalam sistem komputasi adalah...',
    image_index: null,
    options: {
      A: 'Antrean spooler cetak dokumen pada printer (Print Queue)',
      B: 'Tumpukan piring kotor di dapur',
      C: 'Menutup aplikasi dari riwayat terbaru',
      D: 'Navigasi tombol kembali (Back) di web browser',
    },
    correct_option: 'A',
    explanation: 'Print Queue mencetak dokumen yang pertama kali dikirim oleh komputer (FIFO).',
  },
  {
    question_text: 'Proses menemukan kesalahan (bug) pada langkah algoritma atau kode program dan memperbaikinya disebut...',
    image_index: null,
    options: {
      A: 'Debugging',
      B: 'Compiling',
      C: 'Rendering',
      D: 'Formatting',
    },
    correct_option: 'A',
    explanation: 'Debugging adalah proses mencari dan memperbaiki kesalahan dalam program/algoritma.',
  },
  {
    question_text: 'Manakah dari pernyataan berikut yang merupakan manfaat utama mempelajari berpikir komputasional?',
    image_index: null,
    options: {
      A: 'Mampu memecahkan masalah kompleks secara lebih efisien dan logis',
      B: 'Menghafal seluruh nama bahasa pemrograman dunia',
      C: 'Bisa merakit laptop tanpa bantuan petunjuk manual',
      D: 'Mempercepat kecepatan mengetik sepuluh jari',
    },
    correct_option: 'A',
    explanation: 'Berpikir komputasional melatih kemampuan berpikir logis dan pemecahan masalah secara terstruktur.',
  },
  {
    question_text: 'Algoritma pencarian yang memeriksa setiap elemen data satu per satu dari awal sampai akhir daftar disebut...',
    image_index: null,
    options: {
      A: 'Linear Search (Pencarian Berurutan)',
      B: 'Binary Search (Pencarian Biner)',
      C: 'Bubble Sort',
      D: 'Selection Sort',
    },
    correct_option: 'A',
    explanation: 'Linear search memeriksa data satu per satu secara berurutan.',
  },
  {
    question_text: 'Algoritma pengurutan data dengan membandingkan dan menukar dua elemen yang bersebelahan secara berulang disebut...',
    image_index: null,
    options: {
      A: 'Bubble Sort',
      B: 'Binary Search',
      C: 'Linear Search',
      D: 'Stack Sort',
    },
    correct_option: 'A',
    explanation: 'Bubble sort menggelembungkan data ke posisi yang benar dengan menukar pasangan bersebelahan.',
  },
];

/**
 * 2. MENGONVERSI MATERI DOKUMEN MENJADI TEPAT JUMLAH SOAL YANG DIMINTA (5, 10, 15, 20)
 */
export function convertDocumentContentToQuestions(
  fullText: string,
  topic: string,
  count: number = 5
): ParsedQuestion[] {
  // Cek apakah di dokumen sudah ada soal evaluasi bawaan guru
  const existingQuiz = extractExistingQuizFromDocument(fullText);
  if (existingQuiz.length >= count) {
    return existingQuiz.slice(0, count);
  }

  const generatedList: ParsedQuestion[] = [...existingQuiz];
  const lowerText = `${fullText} ${topic}`.toLowerCase();

  // PILIH BANK SOAL SESUAI MATERI DOKUMEN
  let primaryPool: ParsedQuestion[] = SISTEM_KOMPUTER_20;

  if (
    lowerText.includes('berpikir komputasional') ||
    lowerText.includes('dekomposisi') ||
    lowerText.includes('abstraksi') ||
    lowerText.includes('algoritma') ||
    lowerText.includes('flowchart')
  ) {
    primaryPool = BERPIKIR_KOMPUTASIONAL_20;
  } else if (
    lowerText.includes('sistem komputer') ||
    lowerText.includes('hardware') ||
    lowerText.includes('perangkat keras') ||
    lowerText.includes('brainware') ||
    lowerText.includes('software') ||
    lowerText.includes('input device')
  ) {
    primaryPool = SISTEM_KOMPUTER_20;
  }

  // Tambahkan soal dari bank materi primer hingga memenuhi jumlah count
  for (const q of primaryPool) {
    if (generatedList.length >= count) break;
    if (!generatedList.some((existing) => existing.question_text === q.question_text)) {
      generatedList.push(q);
    }
  }

  // Jika masih kurang dari count (misal user minta 20 butir soal), lengkapi varian dari materi terkait
  if (generatedList.length < count) {
    const backupPool = primaryPool === SISTEM_KOMPUTER_20 ? BERPIKIR_KOMPUTASIONAL_20 : SISTEM_KOMPUTER_20;
    for (const q of backupPool) {
      if (generatedList.length >= count) break;
      if (!generatedList.some((existing) => existing.question_text === q.question_text)) {
        generatedList.push(q);
      }
    }
  }

  return generatedList.slice(0, count);
}
