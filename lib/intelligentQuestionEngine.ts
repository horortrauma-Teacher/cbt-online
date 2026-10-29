/**
 * Intelligent Question Engine (Mesin Pembuat Soal CBT Natural & Konkret)
 * Menghasilkan soal ujian sekolah yang WAJAR, LUGAS, dan NYAMBUNG dengan pilihan jawaban.
 * Seperti soal ulangan harian, PAS, dan USBN sekolah di Indonesia (SMP & SMA).
 */

export interface GeneratedQuestionItem {
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

// -----------------------------------------------------------------------------
// BANK SOAL LENGKAP 20 BUTIR UNTUK TOPIK KURIKULUM POPULER
// -----------------------------------------------------------------------------
const TOPIC_PRESETS: Record<string, GeneratedQuestionItem[]> = {
  // ===========================================================================
  // 1. TATA SURYA & ASTRONOMI (IPA SMP / SMA) - 20 BUTIR SOAL LENGKAP
  // ===========================================================================
  'tata surya': [
    {
      question_text: 'Berapakah jumlah planet utama yang diakui secara resmi dalam sistem tata surya kita saat ini?',
      image_index: null,
      options: {
        A: '7 Planet',
        B: '8 Planet',
        C: '9 Planet',
        D: '10 Planet',
      },
      correct_option: 'B',
      explanation: 'Sesuai resolusi International Astronomical Union (IAU) tahun 2006, sistem tata surya kita memiliki 8 planet utama setelah Pluto diklasifikasikan sebagai planet kerdil.',
    },
    {
      question_text: 'Planet dalam tata surya yang memiliki letak paling dekat dengan Matahari adalah...',
      image_index: null,
      options: {
        A: 'Venus',
        B: 'Merkurius',
        C: 'Bumi',
        D: 'Mars',
      },
      correct_option: 'B',
      explanation: 'Merkurius adalah planet terdekat dari Matahari dengan jarak rata-rata sekitar 57,9 juta kilometer.',
    },
    {
      question_text: 'Planet yang memiliki suhu permukaan paling panas di tata surya akibat efek rumah kaca yang sangat ekstrem adalah...',
      image_index: null,
      options: {
        A: 'Merkurius',
        B: 'Venus',
        C: 'Mars',
        D: 'Yupiter',
      },
      correct_option: 'B',
      explanation: 'Venus merupakan planet terpanas karena atmosfernya yang sangat tebal didominasi oleh gas karbon dioksida (CO2) yang memerangkap panas matahari secara ekstrem (mencapai sekitar 465°C).',
    },
    {
      question_text: 'Planet yang sering dijuluki sebagai "Bintang Kejora" atau "Bintang Fajar" karena tampak sangat terang di waktu fajar atau senja adalah...',
      image_index: null,
      options: {
        A: 'Mars',
        B: 'Venus',
        C: 'Yupiter',
        D: 'Saturnus',
      },
      correct_option: 'B',
      explanation: 'Venus memantulkan cahaya matahari dengan sangat kuat melalui awan asam sulfatnya sehingga tampak sebagai objek paling terang di langit malam setelah Bulan.',
    },
    {
      question_text: 'Satu-satunya planet di tata surya yang diketahui memiliki kehidupan dan permukaan yang tertutup oleh air dalam bentuk cair adalah...',
      image_index: null,
      options: {
        A: 'Bumi',
        B: 'Mars',
        C: 'Venus',
        D: 'Merkurius',
      },
      correct_option: 'A',
      explanation: 'Bumi adalah satu-satunya planet yang memiliki lapisan biosfer, atmosfer kaya nitrogen dan oksigen, serta air cair yang menopang kehidupan.',
    },
    {
      question_text: 'Planet yang dijuluki sebagai "Planet Merah" karena permukaannya banyak mengandung mineral besi oksida (karat) adalah...',
      image_index: null,
      options: {
        A: 'Merkurius',
        B: 'Venus',
        C: 'Mars',
        D: 'Saturnus',
      },
      correct_option: 'C',
      explanation: 'Mars memiliki warna kemerahan yang mencolok karena banyaknya kandungan serbuk besi oksida atau karat di tanah dan bebatuannya.',
    },
    {
      question_text: 'Gunung berapi tertinggi di tata surya yang terletak di planet Mars adalah...',
      image_index: null,
      options: {
        A: 'Gunung Everest',
        B: 'Olympus Mons',
        C: 'Mauna Kea',
        D: 'Kilimanjaro',
      },
      correct_option: 'B',
      explanation: 'Olympus Mons adalah gunung berapi perisai raksasa di Mars yang tingginya mencapai hampir tiga kali tinggi Gunung Everest di Bumi.',
    },
    {
      question_text: 'Wilayah yang memisahkan kelompok planet dalam dengan kelompok planet luar di tata surya adalah...',
      image_index: null,
      options: {
        A: 'Sabuk Asteroid',
        B: 'Sabuk Kuiper',
        C: 'Awan Oort',
        D: 'Cincin Saturnus',
      },
      correct_option: 'A',
      explanation: 'Sabuk Asteroid terletak di antara orbit planet Mars dan Yupiter, menjadi batas pemisah alami antara kelompok planet dalam dan planet luar.',
    },
    {
      question_text: 'Planet terbesar di dalam sistem tata surya kita yang memiliki fenomena "Bintik Merah Raksasa" adalah...',
      image_index: null,
      options: {
        A: 'Saturnus',
        B: 'Uranus',
        C: 'Yupiter',
        D: 'Neptunus',
      },
      correct_option: 'C',
      explanation: 'Yupiter adalah planet terbesar di tata surya. Bintik Merah Raksasanya merupakan badai antisiklon raksasa yang telah berlangsung selama ratusan tahun.',
    },
    {
      question_text: 'Satelit alami terbesar di tata surya yang mengitari planet Yupiter adalah...',
      image_index: null,
      options: {
        A: 'Bulan',
        B: 'Titan',
        C: 'Ganymede',
        D: 'Phobos',
      },
      correct_option: 'C',
      explanation: 'Ganymede adalah satelit terbesar di tata surya, ukurannya bahkan lebih besar daripada planet Merkurius.',
    },
    {
      question_text: 'Planet yang terkenal memiliki sistem cincin es paling megah dan spektakuler di tata surya adalah...',
      image_index: null,
      options: {
        A: 'Saturnus',
        B: 'Uranus',
        C: 'Neptunus',
        D: 'Yupiter',
      },
      correct_option: 'A',
      explanation: 'Saturnus memiliki sistem cincin paling menonjol dan luas yang tersusun atas miliaran partikel es, batuan, dan debu angkasa.',
    },
    {
      question_text: 'Satelit alami terbesar milik Saturnus yang memiliki lapisan atmosfer tebal mirip kondisi Bumi purba adalah...',
      image_index: null,
      options: {
        A: 'Titan',
        B: 'Europa',
        C: 'Callisto',
        D: 'Io',
      },
      correct_option: 'A',
      explanation: 'Titan adalah satu-satunya satelit alami di tata surya yang memiliki atmosfer tebal dan danau hidrokarbon cair di permukaannya.',
    },
    {
      question_text: 'Planet yang memiliki poros rotasi sangat miring (sekitar 98 derajat) sehingga tampak berputar menggelinding pada orbitnya adalah...',
      image_index: null,
      options: {
        A: 'Mars',
        B: 'Saturnus',
        C: 'Uranus',
        D: 'Neptunus',
      },
      correct_option: 'C',
      explanation: 'Kemiringan sumbu Uranus mencapai sekitar 98 derajat, menjadikannya planet yang unik karena kutubnya hampir sejajar dengan bidang orbitnya.',
    },
    {
      question_text: 'Planet urutan kedelapan yang merupakan planet terjauh dari Matahari dengan angin atmosfer tercepat di tata surya adalah...',
      image_index: null,
      options: {
        A: 'Uranus',
        B: 'Neptunus',
        C: 'Saturnus',
        D: 'Pluto',
      },
      correct_option: 'B',
      explanation: 'Neptunus adalah planet paling luar di tata surya dengan jarak sekitar 4,5 miliar km dari Matahari dan memiliki badai angin supersonik.',
    },
    {
      question_text: 'Berikut ini yang seluruhnya termasuk ke dalam kelompok Planet Dalam (Planet Terestrial/Kebumian) adalah...',
      image_index: null,
      options: {
        A: 'Merkurius, Venus, Bumi, dan Mars',
        B: 'Yupiter, Saturnus, Uranus, dan Neptunus',
        C: 'Bumi, Mars, Yupiter, dan Saturnus',
        D: 'Merkurius, Venus, Bulan, dan Matahari',
      },
      correct_option: 'A',
      explanation: 'Planet Dalam (terestrial) adalah empat planet yang terletak di sebelah dalam sabuk asteroid dan memiliki permukaan padat berbatu: Merkurius, Venus, Bumi, dan Mars.',
    },
    {
      question_text: 'Berikut ini yang seluruhnya termasuk ke dalam kelompok Planet Luar (Planet Jovian/Raksasa Gas dan Es) adalah...',
      image_index: null,
      options: {
        A: 'Merkurius, Venus, Bumi, dan Mars',
        B: 'Yupiter, Saturnus, Uranus, dan Neptunus',
        C: 'Mars, Yupiter, Saturnus, dan Komet',
        D: 'Bumi, Bulan, Asteroid, dan Meteor',
      },
      correct_option: 'B',
      explanation: 'Planet Luar (Jovian) berada di sebelah luar sabuk asteroid, berukuran sangat besar, dan tersusun terutama atas gas serta es: Yupiter, Saturnus, Uranus, dan Neptunus.',
    },
    {
      question_text: 'Benda langit es berukuran kecil yang mengorbit Matahari dengan orbit lonjong dan memiliki ekor yang selalu menjauhi Matahari disebut...',
      image_index: null,
      options: {
        A: 'Asteroid',
        B: 'Komet',
        C: 'Meteorit',
        D: 'Satelit',
      },
      correct_option: 'B',
      explanation: 'Komet tersusun dari es dan debu. Saat mendekati Matahari, radiasi dan angin matahari meniup materi gas komet sehingga membentuk ekor terang yang selalu menjauhi Matahari.',
    },
    {
      question_text: 'Batuan luar angkasa yang memasuki atmosfer Bumi dan terbakar hingga menghasilkan kilatan cahaya (sering disebut bintang jatuh) adalah...',
      image_index: null,
      options: {
        A: 'Meteoroid',
        B: 'Meteor',
        C: 'Meteorit',
        D: 'Asteroid',
      },
      correct_option: 'B',
      explanation: 'Meteor adalah peristiwa terbakarnya batuan luar angkasa saat bergesekan dengan atmosfer Bumi. Jika batuan tersebut selamat sampai permukaan tanah, dinamakan meteorit.',
    },
    {
      question_text: 'Peristiwa alam di mana posisi Bulan berada tepat di antara Matahari dan Bumi dalam satu garis lurus disebut...',
      image_index: null,
      options: {
        A: 'Gerhana Bulan',
        B: 'Gerhana Matahari',
        C: 'Pasang Perbani',
        D: 'Fase Bulan Sabit',
      },
      correct_option: 'B',
      explanation: 'Gerhana Matahari terjadi ketika Bulan melintas di antara Matahari dan Bumi sehingga bayangan Bulan jatuh menutupi sebagian atau seluruh cahaya Matahari yang menuju Bumi.',
    },
    {
      question_text: 'Salah satu dampak nyata dari peristiwa perputaran Bumi pada porosnya (Rotasi Bumi) dalam kehidupan sehari-hari adalah...',
      image_index: null,
      options: {
        A: 'Pergantian musim di belahan bumi utara dan selatan',
        B: 'Pergantian siang dan malam serta gerak semu harian Matahari',
        C: 'Perubahan rasi bintang sepanjang tahun',
        D: 'Perbedaan lamanya waktu siang dan malam di daerah kutub',
      },
      correct_option: 'B',
      explanation: 'Rotasi Bumi (berputar pada porosnya selama ~24 jam) menyebabkan terjadinya pergantian siang dan malam, gerak semu harian benda langit, dan perbedaan zona waktu.',
    },
  ],

  // ===========================================================================
  // 2. BERPIKIR KOMPUTASIONAL (INFORMATIKA SMP / SMA) - 20 BUTIR SOAL LENGKAP
  // ===========================================================================
  'berpikir komputasional': [
    {
      question_text: 'Dalam berpikir komputasional, proses memecah masalah yang rumit atau besar menjadi bagian-bagian yang lebih kecil dan mudah dikelola disebut...',
      image_index: null,
      options: {
        A: 'Abstraksi',
        B: 'Dekomposisi',
        C: 'Pengenalan Pola',
        D: 'Algoritma',
      },
      correct_option: 'B',
      explanation: 'Dekomposisi adalah teknik memecah masalah besar menjadi sub-masalah yang lebih kecil dan mandiri.',
    },
    {
      question_text: 'Manakah di bawah ini yang merupakan contoh penerapan dekomposisi dalam kehidupan sehari-hari?',
      image_index: null,
      options: {
        A: 'Membagi tugas membersihkan rumah menjadi menyapu, mengepel, mencuci piring, dan merapikan kasur',
        B: 'Mengenali kesamaan bentuk wajah teman dari foto keluarga',
        C: 'Melihat peta rute kendaraan tanpa memperhatikan detail gambar pepohonan di tepi jalan',
        D: 'Mengikuti langkah-langkah membuat nasi goreng sesuai buku resep',
      },
      correct_option: 'A',
      explanation: 'Membagi satu pekerjaan besar (membersihkan rumah) menjadi bagian-bagian pekerjaan spesifik adalah dekomposisi.',
    },
    {
      question_text: 'Proses menyaring informasi dengan hanya fokus pada hal-hal penting dan mengabaikan detail yang tidak relevan disebut...',
      image_index: null,
      options: {
        A: 'Algoritma',
        B: 'Dekomposisi',
        C: 'Abstraksi',
        D: 'Pengulangan',
      },
      correct_option: 'C',
      explanation: 'Abstraksi membuang detail yang tidak penting agar kita bisa berkonsentrasi pada pola inti dari suatu permasalahan.',
    },
    {
      question_text: 'Peta rute kereta api (MRT atau Commuter Line) yang hanya menampilkan stasiun perhentian tanpa detail lekukan jalan raya yang sebenarnya merupakan contoh dari...',
      image_index: null,
      options: {
        A: 'Dekomposisi',
        B: 'Abstraksi',
        C: 'Algoritma',
        D: 'Variabel',
      },
      correct_option: 'B',
      explanation: 'Peta MRT menggunakan prinsip abstraksi karena menyederhanakan rute geografis yang rumit menjadi garis lurus dan titik stasiun yang mudah dipahami penumpang.',
    },
    {
      question_text: 'Kemampuan untuk melihat kesamaan, keteraturan, atau kecenderungan yang berulang pada suatu masalah disebut...',
      image_index: null,
      options: {
        A: 'Pengenalan Pola (Pattern Recognition)',
        B: 'Dekomposisi',
        C: 'Perancangan Algoritma',
        D: 'Debugging',
      },
      correct_option: 'A',
      explanation: 'Pengenalan pola memungkinkan kita memanfaatkan solusi dari masalah-masalah serupa yang pernah ditemui sebelumnya.',
    },
    {
      question_text: 'Seorang mekanik bengkel mengetahui penyebab motor mogok karena mendengar suara mesin yang bunyinya sama dengan motor rusak kemarin. Mekanik ini menerapkan...',
      image_index: null,
      options: {
        A: 'Abstraksi',
        B: 'Pengenalan Pola',
        C: 'Algoritma',
        D: 'Dekomposisi',
      },
      correct_option: 'B',
      explanation: 'Mekanik mengenali gejala berulang (pola bunyi) untuk menentukan kerusakan secara cepat.',
    },
    {
      question_text: 'Urutan langkah-langkah logis dan sistematis yang disusun secara teratur untuk menyelesaikan suatu masalah disebut...',
      image_index: null,
      options: {
        A: 'Abstraksi',
        B: 'Algoritma',
        C: 'Dekomposisi',
        D: 'Enkapsulasi',
      },
      correct_option: 'B',
      explanation: 'Algoritma adalah serangkaian instruksi terurut yang dapat dieksekusi langkah demi langkah untuk mencapai hasil tertentu.',
    },
    {
      question_text: 'Petunjuk langkah demi langkah merakit lemari meja dari pabrik mulai dari menyiapkan baut hingga lemari berdiri tegak merupakan penerapan dari...',
      image_index: null,
      options: {
        A: 'Algoritma',
        B: 'Abstraksi',
        C: 'Dekomposisi',
        D: 'Pengenalan Pola',
      },
      correct_option: 'A',
      explanation: 'Manual panduan langkah demi langkah adalah representasi langsung dari algoritma.',
    },
    {
      question_text: 'Di bawah ini yang BUKAN merupakan salah satu dari 4 pilar utama berpikir komputasional adalah...',
      image_index: null,
      options: {
        A: 'Dekomposisi',
        B: 'Abstraksi',
        C: 'Instalasi Perangkat Keras',
        D: 'Pengenalan Pola',
      },
      correct_option: 'C',
      explanation: 'Empat pilar berpikir komputasional adalah Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma.',
    },
    {
      question_text: 'Dalam diagram alir (flowchart), simbol berbentuk bangun jajaran genjang digunakan untuk menunjukkan...',
      image_index: null,
      options: {
        A: 'Titik awal dan akhir program (Terminal)',
        B: 'Proses perhitungan atau pemrosesan data',
        C: 'Operasi Input atau Output data',
        D: 'Pengambilan keputusan (Decision/Kondisi)',
      },
      correct_option: 'C',
      explanation: 'Jajaran genjang pada flowchart melambangkan masukan (input) atau keluaran (output) data.',
    },
    {
      question_text: 'Simbol belah ketupat pada diagram alir (flowchart) berfungsi untuk...',
      image_index: null,
      options: {
        A: 'Memulai program',
        B: 'Mengambil keputusan berdasarkan kondisi ya/tidak (Decision)',
        C: 'Menghubungkan baris perintah ke halaman lain',
        D: 'Menampilkan teks ke layar monitor',
      },
      correct_option: 'B',
      explanation: 'Belah ketupat (diamond) melambangkan percabangan logika atau keputusan (decision) dengan dua atau lebih jalur keluaran.',
    },
    {
      question_text: 'Metode pencarian data di mana setiap data diperiksa satu per satu secara berurutan dari awal sampai akhir disebut...',
      image_index: null,
      options: {
        A: 'Binary Search',
        B: 'Linear Search (Sequential Search)',
        C: 'Bubble Sort',
        D: 'Quick Sort',
      },
      correct_option: 'B',
      explanation: 'Linear search memeriksa setiap elemen data secara sekuensial dari posisi pertama sampai data yang dicari ditemukan.',
    },
    {
      question_text: 'Syarat utama agar algoritma Binary Search (Pencarian Biner) dapat dijalankan pada sekumpulan data adalah...',
      image_index: null,
      options: {
        A: 'Data harus dalam keadaan sudah terurut (sorted)',
        B: 'Jumlah data harus bernilai ganjil',
        C: 'Semua data harus bertipe bilangan bulat',
        D: 'Data tidak boleh berisi angka nol',
      },
      correct_option: 'A',
      explanation: 'Binary search bekerja dengan membagi dua area pencarian, sehingga sekumpulan data wajib telah terurut sebelumnya.',
    },
    {
      question_text: 'Proses pengurutan data dari nilai terkecil ke nilai terbesar disebut dengan istilah...',
      image_index: null,
      options: {
        A: 'Descending',
        B: 'Ascending',
        C: 'Searching',
        D: 'Filtering',
      },
      correct_option: 'B',
      explanation: 'Ascending artinya pengurutan menaik (dari kecil ke besar: A-Z atau 1-100).',
    },
    {
      question_text: 'Proses pengurutan data dari nilai terbesar menuju ke nilai terkecil disebut dengan istilah...',
      image_index: null,
      options: {
        A: 'Ascending',
        B: 'Descending',
        C: 'Clustering',
        D: 'Looping',
      },
      correct_option: 'B',
      explanation: 'Descending artinya pengurutan menurun (dari besar ke kecil: Z-A atau 100-1).',
    },
    {
      question_text: 'Struktur data di mana data yang terakhir masuk akan menjadi data yang pertama kali keluar (LIFO / Last In First Out) disebut...',
      image_index: null,
      options: {
        A: 'Queue (Antrean)',
        B: 'Stack (Tumpukan)',
        C: 'Tree (Pohon)',
        D: 'Graph (Graf)',
      },
      correct_option: 'B',
      explanation: 'Stack menerapkan prinsip LIFO, persis seperti tumpukan piring bersih di mana piring teratas yang terakhir ditaruh akan diambil pertama kali.',
    },
    {
      question_text: 'Struktur data di mana data yang pertama kali masuk akan menjadi data yang pertama kali keluar (FIFO / First In First Out) disebut...',
      image_index: null,
      options: {
        A: 'Stack (Tumpukan)',
        B: 'Queue (Antrean)',
        C: 'Array',
        D: 'Pointer',
      },
      correct_option: 'B',
      explanation: 'Queue menerapkan prinsip FIFO, sebagaimana antrean loket tiket di mana orang yang datang pertama akan dilayani pertama.',
    },
    {
      question_text: 'Tindakan mencari dan memperbaiki kesalahan (error/bug) dalam sebuah baris kode atau algoritma disebut...',
      image_index: null,
      options: {
        A: 'Compiling',
        B: 'Debugging',
        C: 'Rendering',
        D: 'Encoding',
      },
      correct_option: 'B',
      explanation: 'Debugging adalah proses melacak dan menyingkirkan bug/error dari algoritma atau program komputer.',
    },
    {
      question_text: 'Pola berpikir komputasional sangat penting dipelajari oleh siswa karena bertujuan untuk...',
      image_index: null,
      options: {
        A: 'Mengharuskan semua siswa menjadi programmer profesional',
        B: 'Melatih kemampuan berpikir kritis dan sistematis dalam memecahkan masalah',
        C: 'Mempercepat kerusakan perangkat komputer sekolah',
        D: 'Menggantikan peran guru di dalam ruang kelas',
      },
      correct_option: 'B',
      explanation: 'Tujuan utama berpikir komputasional adalah membekali kemampuan memecahkan masalah (problem solving) secara logis dan terstruktur.',
    },
    {
      question_text: 'Manakah di bawah ini yang paling tepat menggambarkan karakteristik dari sebuah algoritma yang baik?',
      image_index: null,
      options: {
        A: 'Memiliki instruksi yang ambigu dan memiliki banyak penafsiran',
        B: 'Setiap langkah instruksi jelas, tidak bermakna ganda, dan memiliki kondisi berhenti yang pasti',
        C: 'Berjalan tanpa henti secara terus-menerus tanpa akhir',
        D: 'Hanya bisa dipahami oleh penciptanya sendiri',
      },
      correct_option: 'B',
      explanation: 'Algoritma yang baik harus jelas (unambiguous), efektif, memiliki masukan dan keluaran yang terdefinisi, serta berakhir setelah sejumlah langkah berhingga (finiteness).',
    },
  ],

  // ===========================================================================
  // 3. SISTEM KOMPUTER & HARDWARE (INFORMATIKA SMP / SMA) - 20 BUTIR SOAL LENGKAP
  // ===========================================================================
  'sistem komputer': [
    {
      question_text: 'Sistem komputer pada dasarnya terdiri atas 3 komponen pokok yang saling bekerja sama, yaitu...',
      image_index: null,
      options: {
        A: 'Hardware, Software, dan Brainware',
        B: 'Keyboard, Mouse, dan Monitor',
        C: 'Harddisk, RAM, dan Processor',
        D: 'Windows, Linux, dan Microsoft Office',
      },
      correct_option: 'A',
      explanation: 'Tiga pilar sistem komputer adalah Hardware (perangkat keras), Software (perangkat lunak), dan Brainware (manusia pengoperasinya).',
    },
    {
      question_text: 'Komponen fisik dari komputer yang dapat dilihat secara kasat mata dan disentuh secara nyata oleh tangan disebut...',
      image_index: null,
      options: {
        A: 'Software (Perangkat Lunak)',
        B: 'Hardware (Perangkat Keras)',
        C: 'Brainware (Pengguna)',
        D: 'Firmware',
      },
      correct_option: 'B',
      explanation: 'Hardware adalah wujud fisik nyata dari komputer seperti casing, monitor, keyboard, dan papan sirkuit.',
    },
    {
      question_text: 'Komponen perangkat keras yang bertindak sebagai otak komputer untuk memproses instruksi dan mengendalikan seluruh sistem adalah...',
      image_index: null,
      options: {
        A: 'Harddisk Drive (HDD)',
        B: 'Central Processing Unit (CPU)',
        C: 'Random Access Memory (RAM)',
        D: 'Power Supply Unit (PSU)',
      },
      correct_option: 'B',
      explanation: 'CPU (Processor) memproses instruksi aritmetika, logika, dan mengontrol komponen komputer lainnya.',
    },
    {
      question_text: 'Perangkat keras komputer yang berfungsi untuk memasukkan data atau perintah ke dalam sistem komputer (Input Device) adalah...',
      image_index: null,
      options: {
        A: 'Monitor dan Printer',
        B: 'Keyboard, Mouse, dan Scanner',
        C: 'Speaker dan Proyektor',
        D: 'Harddisk dan Flashdisk',
      },
      correct_option: 'B',
      explanation: 'Keyboard, mouse, dan scanner bertugas memasukkan data teks, gerak kursor, dan gambar dari luar ke dalam sistem.',
    },
    {
      question_text: 'Perangkat keras yang bertugas menampilkan atau mengeluarkan hasil dari pemrosesan data (Output Device) adalah...',
      image_index: null,
      options: {
        A: 'Keyboard dan Mikrofon',
        B: 'Monitor, Printer, dan Speaker',
        C: 'Mouse dan Scanner',
        D: 'RAM dan SSD',
      },
      correct_option: 'B',
      explanation: 'Monitor menampilkan visual, printer mencetak kertas, dan speaker menghasilkan gelombang audio.',
    },
    {
      question_text: 'Memori komputer yang bersifat volatile (data sementara akan hilang ketika aliran listrik dimatikan) adalah...',
      image_index: null,
      options: {
        A: 'ROM (Read Only Memory)',
        B: 'Harddisk Drive (HDD)',
        C: 'RAM (Random Access Memory)',
        D: 'Flashdisk USB',
      },
      correct_option: 'C',
      explanation: 'RAM bersifat volatile karena membutuhkan arus listrik kontinu untuk menyimpan data aplikasi yang sedang aktif.',
    },
    {
      question_text: 'Memori internal komputer yang bersifat non-volatile dan berisi instruksi dasar sistem saat pertama kali komputer dinyalakan (BIOS/UEFI) adalah...',
      image_index: null,
      options: {
        A: 'RAM',
        B: 'ROM',
        C: 'Cache Memory',
        D: 'Register',
      },
      correct_option: 'B',
      explanation: 'ROM (Read Only Memory) menyimpan instruksi firmware booting secara permanen yang tidak hilang saat listrik padam.',
    },
    {
      question_text: 'Media penyimpanan sekunder modern berbasis chip memori kilat tanpa piringan berputar yang memiliki kecepatan baca-tulis jauh lebih tinggi dari HDD adalah...',
      image_index: null,
      options: {
        A: 'Floppy Disk',
        B: 'Solid State Drive (SSD)',
        C: 'Compact Disc (CD)',
        D: 'Magnetic Tape',
      },
      correct_option: 'B',
      explanation: 'SSD menggunakan chip semikonduktor flash sehingga bekerja tanpa suara mekanik dan memiliki kecepatan transfer data sangat tinggi.',
    },
    {
      question_text: 'Papan sirkuit utama tempat melekatnya seluruh komponen komputer seperti CPU, RAM, kartu grafis, dan penyimpanan disebut...',
      image_index: null,
      options: {
        A: 'Motherboard (Mainboard)',
        B: 'Heatsink Fan',
        C: 'Sound Card',
        D: 'Network Interface Card',
      },
      correct_option: 'A',
      explanation: 'Motherboard adalah papan induk sirkuit elektronik utama yang menghubungkan seluruh jalur komunikasi antarperangkat keras.',
    },
    {
      question_text: 'Perangkat keras yang bertugas mengalirkan dan mendistribusikan arus listrik ke seluruh komponen di dalam casing komputer adalah...',
      image_index: null,
      options: {
        A: 'VGA Card',
        B: 'Power Supply Unit (PSU)',
        C: 'Optical Drive',
        D: 'LAN Card',
      },
      correct_option: 'B',
      explanation: 'PSU mengubah arus AC dari stopkontak menjadi arus DC bervoltase rendah yang aman untuk komponen internal komputer.',
    },
    {
      question_text: 'Perangkat lunak dasar yang bertindak sebagai jembatan antara perangkat keras komputer dengan pengguna dan aplikasi (misal Windows, macOS, Linux) disebut...',
      image_index: null,
      options: {
        A: 'Sistem Operasi (Operating System)',
        B: 'Aplikasi Grafis',
        C: 'Bahasa Pemrograman',
        D: 'Browser Web',
      },
      correct_option: 'A',
      explanation: 'Sistem Operasi mengelola memori, proses, manajemen file, dan perangkat input/output pada komputer.',
    },
    {
      question_text: 'Orang atau manusia yang menggunakan, mengoperasikan, dan mengelola komputer dinamakan...',
      image_index: null,
      options: {
        A: 'Hardware',
        B: 'Software',
        C: 'Brainware',
        D: 'Freeware',
      },
      correct_option: 'C',
      explanation: 'Brainware mencakup operator komputer, administrator jaringan, teknisi, analis sistem, dan pemrogram.',
    },
    {
      question_text: 'Komponen di dalam CPU yang bertanggung jawab melakukan operasi perhitungan matematika (penjumlahan, pengurangan) dan logika perbandingan adalah...',
      image_index: null,
      options: {
        A: 'Control Unit (CU)',
        B: 'Arithmetic Logic Unit (ALU)',
        C: 'Register',
        D: 'System Bus',
      },
      correct_option: 'B',
      explanation: 'ALU (Arithmetic Logic Unit) bertugas mengeksekusi semua operasi aritmetika dan logika.',
    },
    {
      question_text: 'Bagian CPU yang bertugas mengatur dan mengendalikan semua lalu lintas instruksi serta sinkronisasi sinyal clock adalah...',
      image_index: null,
      options: {
        A: 'Arithmetic Logic Unit (ALU)',
        B: 'Control Unit (CU)',
        C: 'Random Access Memory (RAM)',
        D: 'Input Port',
      },
      correct_option: 'B',
      explanation: 'CU (Control Unit) mengambil instruksi dari memori, menerjemahkannya (decode), dan mengatur eksekusinya.',
    },
    {
      question_text: 'Perangkat keras kartu grafis yang bertugas memproses data gambar dan render 3D untuk ditampilkan ke layar monitor dinamakan...',
      image_index: null,
      options: {
        A: 'Sound Card',
        B: 'Video Graphics Array (VGA / GPU)',
        C: 'LAN Card',
        D: 'Expansion Slot',
      },
      correct_option: 'B',
      explanation: 'GPU / VGA card memproses instruksi visual sehingga tampilan grafis monitor berjalan mulus dan beresolusi tinggi.',
    },
    {
      question_text: 'Satuan terkecil data dalam sistem komputasi digital yang hanya bernilai 0 atau 1 disebut...',
      image_index: null,
      options: {
        A: 'Byte',
        B: 'Bit (Binary Digit)',
        C: 'Nibble',
        D: 'Pixel',
      },
      correct_option: 'B',
      explanation: 'Bit adalah kependekan dari Binary Digit yang merupakan unit terkecil dengan nilai 0 atau 1.',
    },
    {
      question_text: 'Satu Byte dalam sistem komputer digital tersusun atas gabungan berapa bit?',
      image_index: null,
      options: {
        A: '4 Bit',
        B: '8 Bit',
        C: '16 Bit',
        D: '32 Bit',
      },
      correct_option: 'B',
      explanation: '1 Byte tersusun dari 8 Bit data.',
    },
    {
      question_text: 'Port penghubung universal yang paling banyak digunakan saat ini untuk menghubungkan keyboard, mouse, flashdisk, dan printer ke komputer adalah...',
      image_index: null,
      options: {
        A: 'Port VGA',
        B: 'Port USB (Universal Serial Bus)',
        C: 'Port Serial COM',
        D: 'Port Parallel LPT',
      },
      correct_option: 'B',
      explanation: 'Port USB merupakan antarmuka standar colokan perangkat periferal modern.',
    },
    {
      question_text: 'Port antarmuka digital yang digunakan untuk mengirimkan sinyal video berkualitas tinggi sekaligus sinyal audio audio ke monitor/TV adalah...',
      image_index: null,
      options: {
        A: 'Port HDMI',
        B: 'Port PS/2',
        C: 'Port Jack Audio 3.5mm',
        D: 'Port RJ-11',
      },
      correct_option: 'A',
      explanation: 'HDMI (High-Definition Multimedia Interface) menghantarkan data video resolusi tinggi beserta audio multi-saluran dalam satu kabel.',
    },
    {
      question_text: 'Siklus kerja mendasar pemrosesan data pada komputer secara berurutan adalah...',
      image_index: null,
      options: {
        A: 'Output -> Process -> Input',
        B: 'Input -> Process -> Output -> Storage',
        C: 'Storage -> Output -> Input',
        D: 'Process -> Storage -> Input',
      },
      correct_option: 'B',
      explanation: 'Siklus komputasi standar diawali dengan Input (pemasukan data), Process (pemrosesan oleh CPU), Output (penyajian hasil), dan Storage (penyimpanan data).',
    },
  ],

  // ===========================================================================
  // 4. JARINGAN KOMPUTER & INTERNET (INFORMATIKA SMP / SMA) - 20 BUTIR SOAL LENGKAP
  // ===========================================================================
  'jaringan komputer': [
    {
      question_text: 'Perangkat jaringan yang berfungsi menghubungkan dua atau lebih jaringan yang berbeda serta menentukan rute terbaik pengiriman paket data adalah...',
      image_index: null,
      options: {
        A: 'Switch',
        B: 'Router',
        C: 'Hub',
        D: 'Repeater',
      },
      correct_option: 'B',
      explanation: 'Router bekerja di layer jaringan (Network Layer) untuk merutekan paket data antarsubnet atau ke jaringan internet.',
    },
    {
      question_text: 'Jaringan komputer yang hanya mencakup area geografis terbatas seperti ruangan laboratorium sekolah, kantor, atau satu gedung disebut...',
      image_index: null,
      options: {
        A: 'LAN (Local Area Network)',
        B: 'MAN (Metropolitan Area Network)',
        C: 'WAN (Wide Area Network)',
        D: 'PAN (Personal Area Network)',
      },
      correct_option: 'A',
      explanation: 'LAN adalah jaringan lokal berskala kecil dalam lingkup gedung atau ruangan.',
    },
    {
      question_text: 'Jaringan komputer berskala global yang menghubungkan komputer di seluruh penjuru dunia adalah...',
      image_index: null,
      options: {
        A: 'LAN',
        B: 'MAN',
        C: 'WAN (Termasuk Internet)',
        D: 'Intranet Lokal',
      },
      correct_option: 'C',
      explanation: 'WAN (Wide Area Network) mencakup koneksi jarak jauh lintas kota, pulau, dan benua, contoh terbesarnya adalah Internet.',
    },
    {
      question_text: 'Topologi jaringan di mana seluruh komputer dihubungkan ke satu konsentrator pusat (Switch/Hub) menyerupai pola bintang dinamakan...',
      image_index: null,
      options: {
        A: 'Topologi Star',
        B: 'Topologi Bus',
        C: 'Topologi Ring',
        D: 'Topologi Mesh',
      },
      correct_option: 'A',
      explanation: 'Topologi Star menghubungkan semua simpul ke perangkat tengah sehingga kerusakan pada satu kabel tidak mengganggu komputer lain.',
    },
    {
      question_text: 'Alamat numerik unik yang menjadi identitas setiap perangkat yang terhubung ke jaringan internet disebut...',
      image_index: null,
      options: {
        A: 'MAC Address',
        B: 'IP Address (Internet Protocol)',
        C: 'URL Web',
        D: 'Subnet Mask',
      },
      correct_option: 'B',
      explanation: 'IP Address adalah identitas logis bagi setiap perangkat untuk mengirim dan menerima paket informasi di internet.',
    },
    {
      question_text: 'Layanan di internet yang berfungsi menerjemahkan nama domain (seperti www.kemdikbud.go.id) menjadi alamat IP angka adalah...',
      image_index: null,
      options: {
        A: 'DHCP Server',
        B: 'Domain Name System (DNS)',
        C: 'File Transfer Protocol (FTP)',
        D: 'Firewall',
      },
      correct_option: 'B',
      explanation: 'DNS bertindak seperti buku telepon internet yang mengubah nama domain yang mudah diingat manusia menjadi IP Address komputer.',
    },
    {
      question_text: 'Kabel jaringan yang mentransmisikan data dalam bentuk sinyal pulsa cahaya melalui serat kaca silika berkecepatan sangat tinggi adalah...',
      image_index: null,
      options: {
        A: 'Kabel UTP Cat 6',
        B: 'Kabel Koaksial',
        C: 'Kabel Fiber Optik',
        D: 'Kabel STP',
      },
      correct_option: 'C',
      explanation: 'Fiber Optik menghantarkan pulsa cahaya berkecepatan tinggi, bebas interferensi gelombang elektromagnetik, dan berjarak jangkau jauh.',
    },
    {
      question_text: 'Kabel tembaga yang paling umum digunakan untuk menghubungkan komputer ke switch di laboratorium sekolah dengan konektor RJ-45 adalah...',
      image_index: null,
      options: {
        A: 'Kabel UTP (Unshielded Twisted Pair)',
        B: 'Kabel HDMI',
        C: 'Kabel VGA',
        D: 'Kabel Listrik PLN',
      },
      correct_option: 'A',
      explanation: 'Kabel UTP dengan konektor RJ-45 adalah standar utama kabel jaringan LAN.',
    },
    {
      question_text: 'Protokol keamanan web yang ditandai dengan ikon gembok dan awalan https:// pada bilah peramban internet berfungsi untuk...',
      image_index: null,
      options: {
        A: 'Menghapus histori penelusuran secara otomatis',
        B: 'Mengenkripsi data antara browser dan server agar tidak dapat disadap pihak ketiga',
        C: 'Mempercepat kecepatan sinyal Wi-Fi di rumah',
        D: 'Menghalangi siswa membuka akun media sosial',
      },
      correct_option: 'B',
      explanation: 'HTTPS menggunakan enkripsi SSL/TLS untuk melindungi kerahasiaan data pengguna saat bertransaksi di situs web.',
    },
    {
      question_text: 'Perangkat keras atau perangkat lunak yang bertugas menyaring dan memblokir akses mencurigakan dari luar jaringan komputer disebut...',
      image_index: null,
      options: {
        A: 'Firewall',
        B: 'Gateway',
        C: 'Web Server',
        D: 'Modem',
      },
      correct_option: 'A',
      explanation: 'Firewall melindungi sistem jaringan dengan menerapkan aturan filtrasi paket lalu lintas masuk dan keluar.',
    },
    {
      question_text: 'Perangkat jaringan yang bertugas mengubah sinyal analog dari penyedia layanan internet menjadi sinyal digital untuk komputer adalah...',
      image_index: null,
      options: {
        A: 'Modem (Modulator Demodulator)',
        B: 'Switch',
        C: 'Printer Server',
        D: 'Sound Card',
      },
      correct_option: 'A',
      explanation: 'Modem bertugas memodulasi sinyal analog ke digital dan sebaliknya.',
    },
    {
      question_text: 'Teknologi jaringan nirkabel jarak dekat yang biasa digunakan untuk menghubungkan smartphone dengan headset, mouse, atau keyboard adalah...',
      image_index: null,
      options: {
        A: 'Bluetooth',
        B: 'Wi-Fi 6',
        C: 'Satelit Geostasioner',
        D: 'Kabel Fiber Optik',
      },
      correct_option: 'A',
      explanation: 'Bluetooth adalah standar nirkabel jarak pendek (PAN) dengan konsumsi daya rendah.',
    },
    {
      question_text: 'Model arsitektur jaringan di mana semua komputer memiliki kedudukan yang setara tanpa adanya komputer server khusus disebut...',
      image_index: null,
      options: {
        A: 'Client-Server',
        B: 'Peer-to-Peer (P2P)',
        C: 'Mainframe-Terminal',
        D: 'Cloud Computing',
      },
      correct_option: 'B',
      explanation: 'Pada jaringan Peer-to-Peer (P2P), setiap komputer dapat bertindak sebagai server maupun klien secara bersamaan.',
    },
    {
      question_text: 'Layanan jaringan yang otomatis membagikan konfigurasi IP Address kepada komputer klien tanpa perlu disetel manual adalah...',
      image_index: null,
      options: {
        A: 'DHCP (Dynamic Host Configuration Protocol)',
        B: 'FTP (File Transfer Protocol)',
        C: 'SMTP (Simple Mail Transfer Protocol)',
        D: 'HTTP (Hypertext Transfer Protocol)',
      },
      correct_option: 'A',
      explanation: 'DHCP secara otomatis meminjamkan alamat IP ke setiap perangkat yang baru terhubung ke jaringan.',
    },
    {
      question_text: 'Kecepatan maksimum transfer data dalam satuan bit per detik (bps) yang dapat dialirkan melalui saluran jaringan dinamakan...',
      image_index: null,
      options: {
        A: 'Latency',
        B: 'Bandwidth',
        C: 'Ping',
        D: 'Jitter',
      },
      correct_option: 'B',
      explanation: 'Bandwidth menyatakan kapasitas lebar pita data yang bisa dilewatkan dalam kurun waktu satu detik.',
    },
    {
      question_text: 'Waktu jeda atau waktu tunda yang dibutuhkan oleh paket data untuk menempuh perjalanan dari komputer pengirim sampai ke tujuan disebut...',
      image_index: null,
      options: {
        A: 'Latency (Ping)',
        B: 'Bandwidth',
        C: 'Throughput',
        D: 'Download Rate',
      },
      correct_option: 'A',
      explanation: 'Latency (sering diukur dengan nilai Ping dalam milidetik) menunjukkan seberapa cepat respons koneksi jaringan.',
    },
    {
      question_text: 'Topologi jaringan di mana semua komputer dihubungkan ke satu kabel utama (backbone) yang kedua ujungnya dipasangi terminator adalah...',
      image_index: null,
      options: {
        A: 'Topologi Bus',
        B: 'Topologi Star',
        C: 'Topologi Ring',
        D: 'Topologi Tree',
      },
      correct_option: 'A',
      explanation: 'Topologi Bus menggunakan satu kabel tunggal memanjang tempat setiap terminal terhubung.',
    },
    {
      question_text: 'Format alamat IP versi 4 (IPv4) tersusun atas deretan berapa bit bilangan biner?',
      image_index: null,
      options: {
        A: '16 Bit',
        B: '32 Bit',
        C: '64 Bit',
        D: '128 Bit',
      },
      correct_option: 'B',
      explanation: 'IPv4 terdiri dari 32 bit yang dipisahkan menjadi 4 oktet angka desimal (contoh: 192.168.1.1).',
    },
    {
      question_text: 'Format alamat IP versi 6 (IPv6) yang diciptakan untuk mengatasi keterbatasan kuota alamat IPv4 memiliki panjang...',
      image_index: null,
      options: {
        A: '32 Bit',
        B: '64 Bit',
        C: '128 Bit',
        D: '256 Bit',
      },
      correct_option: 'C',
      explanation: 'IPv6 memiliki panjang 128 bit yang ditulis dalam notasi heksadesimal.',
    },
    {
      question_text: 'Perangkat keras nirkabel yang memancarkan sinyal Wi-Fi di ruangan kelas agar laptop dan ponsel siswa dapat terhubung ke jaringan sekolah dinamakan...',
      image_index: null,
      options: {
        A: 'Wireless Access Point (AP)',
        B: 'Hub Pasif',
        C: 'Konektor RJ-11',
        D: 'Terminator Kabel',
      },
      correct_option: 'A',
      explanation: 'Access Point bertindak sebagai pemancar dan penerima sinyal radio Wi-Fi lokal.',
    },
  ],

  // ===========================================================================
  // 5. EKOSISTEM & LINGKUNGAN (IPA SMP / SMA) - 20 BUTIR SOAL LENGKAP
  // ===========================================================================
  'ekosistem': [
    {
      question_text: 'Dalam sebuah rantai makanan di sawah, organisme yang bertindak sebagai produsen utama adalah...',
      image_index: null,
      options: {
        A: 'Padi',
        B: 'Tikus',
        C: 'Ular',
        D: 'Burung Elang',
      },
      correct_option: 'A',
      explanation: 'Padi adalah tumbuhan autotrof yang memproduksi makanan sendiri melalui proses fotosintesis.',
    },
    {
      question_text: 'Hubungan timbal balik antara dua makhluk hidup di mana kedua belah pihak saling mendapatkan keuntungan disebut simbiosis...',
      image_index: null,
      options: {
        A: 'Parasitisme',
        B: 'Komensalisme',
        C: 'Mutualisme',
        D: 'Amensalisme',
      },
      correct_option: 'C',
      explanation: 'Simbiosis mutualisme saling menguntungkan kedua belah pihak, seperti kupu-kupu dengan bunga mekar.',
    },
    {
      question_text: 'Hubungan antara ikan hiu dengan ikan remora, di mana ikan remora mendapat sisa makanan tanpa merugikan atau menguntungkan ikan hiu, disebut simbiosis...',
      image_index: null,
      options: {
        A: 'Komensalisme',
        B: 'Mutualisme',
        C: 'Parasitisme',
        D: 'Predasi',
      },
      correct_option: 'A',
      explanation: 'Simbiosis komensalisme adalah hubungan di mana satu pihak untung dan pihak lainnya netral (tidak dirugikan maupun diuntungkan).',
    },
    {
      question_text: 'Hubungan antara benalu yang menempel pada pohon mangga dan menyerap sari makanan dari pohon tersebut disebut simbiosis...',
      image_index: null,
      options: {
        A: 'Mutualisme',
        B: 'Komensalisme',
        C: 'Parasitisme',
        D: 'Netralisme',
      },
      correct_option: 'C',
      explanation: 'Simbiosis parasitisme merugikan organisme inang sementara parasit mengambil keuntungan nutrisi.',
    },
    {
      question_text: 'Organisme yang bertugas menguraikan sisa-sisa makhluk hidup yang telah mati menjadi zat hara penyubur tanah disebut...',
      image_index: null,
      options: {
        A: 'Konsumen Primer',
        B: 'Dekomposer (Pengurai)',
        C: 'Karnivora Puncak',
        D: 'Produsen',
      },
      correct_option: 'B',
      explanation: 'Dekomposer (bakteri pengurai dan jamur) mendaur ulang materi organik kembali ke lingkungan.',
    },
    {
      question_text: 'Sekumpulan individu dari spesies yang sama yang mendiami suatu wilayah tertentu pada waktu yang sama disebut...',
      image_index: null,
      options: {
        A: 'Komunitas',
        B: 'Populasi',
        C: 'Ekosistem',
        D: 'Biosfer',
      },
      correct_option: 'B',
      explanation: 'Populasi adalah kumpulan individu sejenis (contoh: populasi katak di kolam).',
    },
    {
      question_text: 'Kumpulan berbagai macam populasi makhluk hidup yang saling berinteraksi di suatu wilayah tertentu disebut...',
      image_index: null,
      options: {
        A: 'Komunitas',
        B: 'Individu',
        C: 'Bioma',
        D: 'Habitat',
      },
      correct_option: 'A',
      explanation: 'Komunitas mencakup seluruh populasi makhluk hidup yang menempati satu habitat yang sama.',
    },
    {
      question_text: 'Komponen dalam ekosistem yang terdiri atas benda-benda tak hidup seperti udara, air, tanah, dan cahaya matahari disebut komponen...',
      image_index: null,
      options: {
        A: 'Biotik',
        B: 'Abiotik',
        C: 'Heterotrof',
        D: 'Autotrof',
      },
      correct_option: 'B',
      explanation: 'Komponen abiotik adalah faktor fisik dan kimia tak hidup pendukung ekosistem.',
    },
    {
      question_text: 'Hewan pemakan tumbuhan yang menduduki tingkat trofik sebagai konsumen tingkat I disebut hewan...',
      image_index: null,
      options: {
        A: 'Herbivora',
        B: 'Karnivora',
        C: 'Omnivora',
        D: 'Insektivora',
      },
      correct_option: 'A',
      explanation: 'Herbivora adalah konsumen primer yang memakan tumbuhan secara langsung (contoh: kelinci, kambing, sapi).',
    },
    {
      question_text: 'Hewan yang memangsa hewan lain dan menduduki tingkat trofik konsumen II atau lebih tinggi disebut hewan...',
      image_index: null,
      options: {
        A: 'Herbivora',
        B: 'Karnivora',
        C: 'Autotrof',
        D: 'Detritivora',
      },
      correct_option: 'B',
      explanation: 'Karnivora adalah hewan pemakan daging hewan lain (contoh: harimau, singa, elang).',
    },
    {
      question_text: 'Makhluk hidup yang memakan baik tumbuhan maupun daging hewan (pemakan segalanya) dinamakan...',
      image_index: null,
      options: {
        A: 'Herbivora',
        B: 'Karnivora',
        C: 'Omnivora',
        D: 'Saprofit',
      },
      correct_option: 'C',
      explanation: 'Omnivora memakan tumbuhan sekaligus daging hewan (contoh: ayam, beruang, tikus).',
    },
    {
      question_text: 'Gabungan dari beberapa rantai makanan yang saling berhubungan dan tumpang tindih dalam satu ekosistem disebut...',
      image_index: null,
      options: {
        A: 'Piramida Energi',
        B: 'Jaring-jaring Makanan',
        C: 'Siklus Biogeokimia',
        D: 'Suksesi Primer',
      },
      correct_option: 'B',
      explanation: 'Jaring-jaring makanan menggambarkan kompleksitas aliran energi antar rantai makanan di alam nyata.',
    },
    {
      question_text: 'Dalam piramida energi, tingkat trofik yang memiliki jumlah energi terbesar adalah...',
      image_index: null,
      options: {
        A: 'Produsen (Tingkat Trofik I)',
        B: 'Konsumen I (Herbivora)',
        C: 'Konsumen II (Karnivora Kecil)',
        D: 'Konsumen Puncak',
      },
      correct_option: 'A',
      explanation: 'Produsen memanen energi langsung dari matahari sehingga memegang energi dasar terbesar (hukum transfer energi 10%).',
    },
    {
      question_text: 'Hewan yang memakan partikel sisa-sisa bahan organik yang membusuk (seperti cacing tanah dan teripang) disebut...',
      image_index: null,
      options: {
        A: 'Detritivora',
        B: 'Autotrof',
        C: 'Produsen',
        D: 'Parasit Obligat',
      },
      correct_option: 'A',
      explanation: 'Detritivora mencerna serpihan detritus organik mati.',
    },
    {
      question_text: 'Peristiwa perpindahan materi dan energi melalui proses makan dan dimakan dengan urutan satu arah disebut...',
      image_index: null,
      options: {
        A: 'Rantai Makanan',
        B: 'Simbiosis',
        C: 'Habitat',
        D: 'Nisia',
      },
      correct_option: 'A',
      explanation: 'Rantai makanan adalah alur linier satu arah pemangsaan antarorganisme.',
    },
    {
      question_text: 'Jika pada suatu ekosistem sawah populasi ular dibasmi secara berlebihan oleh manusia, akibat yang paling mungkin terjadi adalah...',
      image_index: null,
      options: {
        A: 'Populasi tikus meningkat pesat sehingga merusak tanaman padi',
        B: 'Populasi elang meningkat tajam',
        C: 'Produksi panen padi meningkat drastis',
        D: 'Jumlah air sawah langsung mengering',
      },
      correct_option: 'A',
      explanation: 'Hilangnya predator alami ular menyebabkan populasi hama tikus meledak tanpa terkendali.',
    },
    {
      question_text: 'Proses perubahan struktur komunitas tumbuhan dan hewan secara bertahap dari waktu ke waktu menuju ekosistem klimaks dinamakan...',
      image_index: null,
      options: {
        A: 'Eutrofikasi',
        B: 'Suksesi Ekologis',
        C: 'Aklimatisasi',
        D: 'Mutasi Alami',
      },
      correct_option: 'B',
      explanation: 'Suksesi ekologis adalah tahapan pemulihan atau perkembangan ekosistem dari komunitas perintis menuju klimaks stabil.',
    },
    {
      question_text: 'Penimbunan senyawa beracun (seperti pestisida DDT atau merkuri) dalam konsentrasi yang semakin tinggi pada tingkat trofik puncak dinamakan...',
      image_index: null,
      options: {
        A: 'Biomagnifikasi',
        B: 'Biodiversitas',
        C: 'Bioetanol',
        D: 'Biogas',
      },
      correct_option: 'A',
      explanation: 'Biomagnifikasi adalah akumulasi zat polutan beracun yang semakin pekat seiring naiknya tingkatan rantai makanan.',
    },
    {
      question_text: 'Fenomena ledakan pertumbuhan alga atau eceng gondok di danau akibat pencemaran limbah pupuk fosfat dan nitrogen disebut...',
      image_index: null,
      options: {
        A: 'Eutrofikasi',
        B: 'Erosi',
        C: 'Abrasi',
        D: 'Desertifikasi',
      },
      correct_option: 'A',
      explanation: 'Eutrofikasi menyebabkan pendangkalan danau dan penurunan kadar oksigen terlarut bagi ikan.',
    },
    {
      question_text: 'Upaya pelestarian makhluk hidup yang dilakukan langsung di dalam habitat aslinya (seperti Taman Nasional Komodo dan Ujung Kulon) disebut pelestarian...',
      image_index: null,
      options: {
        A: 'In Situ',
        B: 'Ex Situ',
        C: 'Karantina',
        D: 'Kebun Binatang',
      },
      correct_option: 'A',
      explanation: 'Pelestarian in situ melindungi satwa dan tumbuhan langka di dalam habitat aslinya di alam liar.',
    },
  ],

  // ===========================================================================
  // 6. ALJABAR & OPERASI HITUNG (MATEMATIKA SMP / SMA) - 20 BUTIR SOAL LENGKAP
  // ===========================================================================
  'aljabar': [
    {
      question_text: 'Pada bentuk aljabar <strong>5x² - 3x + 8</strong>, koefisien dari variabel <strong>x</strong> adalah...',
      image_index: null,
      options: {
        A: '-3',
        B: '3',
        C: '5',
        D: '8',
      },
      correct_option: 'A',
      explanation: 'Koefisien adalah bilangan pengali yang menyertai variabel. Pada suku -3x, koefisien dari x adalah -3.',
    },
    {
      question_text: 'Konstanta dari bentuk aljabar <strong>2x² + 7x - 15</strong> adalah...',
      image_index: null,
      options: {
        A: '-15',
        B: '2',
        C: '7',
        D: '15',
      },
      correct_option: 'A',
      explanation: 'Konstanta adalah suku aljabar yang nilainya tetap dan tidak memuat variabel sama sekali, yaitu -15.',
    },
    {
      question_text: 'Variabel-variabel yang terdapat pada bentuk aljabar <strong>4a - 7b + 12</strong> adalah...',
      image_index: null,
      options: {
        A: 'a dan b',
        B: '4 dan -7',
        C: '12',
        D: '4a dan 7b',
      },
      correct_option: 'A',
      explanation: 'Variabel adalah lambang pengganti suatu nilai yang belum diketahui secara pasti, yaitu huruf a dan b.',
    },
    {
      question_text: 'Bentuk paling sederhana dari <strong>5x + 3y - 2x + 4y</strong> adalah...',
      image_index: null,
      options: {
        A: '3x + 7y',
        B: '7x + 7y',
        C: '3x - y',
        D: '7x - y',
      },
      correct_option: 'A',
      explanation: 'Kelompokkan suku-suku sejenis: (5x - 2x) + (3y + 4y) = 3x + 7y.',
    },
    {
      question_text: 'Hasil penjumlahan dari bentuk aljabar <strong>(4a - 5b) + (2a + 8b)</strong> adalah...',
      image_index: null,
      options: {
        A: '6a + 3b',
        B: '6a - 13b',
        C: '2a + 3b',
        D: '6a - 3b',
      },
      correct_option: 'A',
      explanation: '(4a + 2a) + (-5b + 8b) = 6a + 3b.',
    },
    {
      question_text: 'Hasil pengurangan <strong>(7x - 3)</strong> oleh <strong>(4x + 5)</strong> adalah...',
      image_index: null,
      options: {
        A: '3x - 8',
        B: '3x + 2',
        C: '11x + 2',
        D: '3x - 2',
      },
      correct_option: 'A',
      explanation: '(7x - 3) - (4x + 5) = 7x - 3 - 4x - 5 = 3x - 8.',
    },
    {
      question_text: 'Hasil perkalian suku tunggal <strong>3(2x - 5)</strong> adalah...',
      image_index: null,
      options: {
        A: '6x - 15',
        B: '6x - 5',
        C: '5x - 15',
        D: '6x + 15',
      },
      correct_option: 'A',
      explanation: 'Gunakan sifat distributif perkalian terhadap pengurangan: 3 * 2x - 3 * 5 = 6x - 15.',
    },
    {
      question_text: 'Bentuk sederhana dari hasil perkalian <strong>(x + 3)(x + 5)</strong> adalah...',
      image_index: null,
      options: {
        A: 'x² + 8x + 15',
        B: 'x² + 15x + 8',
        C: 'x² + 8x + 8',
        D: '2x + 8',
      },
      correct_option: 'A',
      explanation: '(x + 3)(x + 5) = x² + 5x + 3x + 15 = x² + 8x + 15.',
    },
    {
      question_text: 'Bentuk sederhana dari hasil perkalian <strong>(x - 4)(x + 4)</strong> adalah...',
      image_index: null,
      options: {
        A: 'x² - 16',
        B: 'x² + 16',
        C: 'x² - 8x - 16',
        D: 'x² - 8',
      },
      correct_option: 'A',
      explanation: 'Sesuai rumus selisih kuadrat (a - b)(a + b) = a² - b², maka (x - 4)(x + 4) = x² - 16.',
    },
    {
      question_text: 'Hasil penjabaran dari <strong>(2x + 3)²</strong> adalah...',
      image_index: null,
      options: {
        A: '4x² + 12x + 9',
        B: '4x² + 9',
        C: '4x² + 6x + 9',
        D: '2x² + 12x + 9',
      },
      correct_option: 'A',
      explanation: '(2x + 3)² = (2x)² + 2(2x)(3) + 3² = 4x² + 12x + 9.',
    },
    {
      question_text: 'Bentuk sederhana dari pembagian aljabar <strong>12x³y² : 4xy</strong> adalah...',
      image_index: null,
      options: {
        A: '3x²y',
        B: '3xy²',
        C: '4x²y',
        D: '8x²y',
      },
      correct_option: 'A',
      explanation: '(12 / 4) * (x³ / x) * (y² / y) = 3 * x² * y = 3x²y.',
    },
    {
      question_text: 'Bentuk faktorisasi dari <strong>x² - 25</strong> adalah...',
      image_index: null,
      options: {
        A: '(x + 5)(x - 5)',
        B: '(x - 5)(x - 5)',
        C: '(x + 5)(x + 5)',
        D: '(x - 25)(x + 1)',
      },
      correct_option: 'A',
      explanation: 'Faktorisasi selisih dua kuadrat x² - a² = (x + a)(x - a), sehingga x² - 25 = (x + 5)(x - 5).',
    },
    {
      question_text: 'Bentuk faktorisasi dari persamaan kuadrat <strong>x² + 7x + 10</strong> adalah...',
      image_index: null,
      options: {
        A: '(x + 2)(x + 5)',
        B: '(x + 1)(x + 10)',
        C: '(x - 2)(x - 5)',
        D: '(x + 7)(x + 10)',
      },
      correct_option: 'A',
      explanation: 'Dua angka dengan jumlah 7 dan hasil kali 10 adalah 2 dan 5. Maka faktornya adalah (x + 2)(x + 5).',
    },
    {
      question_text: 'Bentuk faktorisasi dari <strong>x² - 5x + 6</strong> adalah...',
      image_index: null,
      options: {
        A: '(x - 2)(x - 3)',
        B: '(x - 1)(x - 6)',
        C: '(x + 2)(x + 3)',
        D: '(x + 1)(x - 6)',
      },
      correct_option: 'A',
      explanation: 'Dua angka dengan jumlah -5 dan hasil kali 6 adalah -2 dan -3. Maka faktornya adalah (x - 2)(x - 3).',
    },
    {
      question_text: 'Jika diketahui nilai <strong>x = 4</strong>, maka nilai dari bentuk aljabar <strong>3x - 5</strong> adalah...',
      image_index: null,
      options: {
        A: '7',
        B: '12',
        C: '9',
        D: '17',
      },
      correct_option: 'A',
      explanation: 'Substitusikan x = 4 ke dalam persamaan: 3(4) - 5 = 12 - 5 = 7.',
    },
    {
      question_text: 'Jika <strong>a = 3</strong> dan <strong>b = -2</strong>, maka nilai dari <strong>2a - 3b</strong> adalah...',
      image_index: null,
      options: {
        A: '12',
        B: '0',
        C: '-12',
        D: '6',
      },
      correct_option: 'A',
      explanation: 'Substitusikan nilai a dan b: 2(3) - 3(-2) = 6 - (-6) = 6 + 6 = 12.',
    },
    {
      question_text: 'Nilai x yang memenuhi persamaan linear satu variabel <strong>2x + 7 = 19</strong> adalah...',
      image_index: null,
      options: {
        A: 'x = 6',
        B: 'x = 5',
        C: 'x = 7',
        D: 'x = 12',
      },
      correct_option: 'A',
      explanation: '2x = 19 - 7 -> 2x = 12 -> x = 6.',
    },
    {
      question_text: 'Penyelesaian dari persamaan linear <strong>4x - 6 = 2x + 8</strong> adalah...',
      image_index: null,
      options: {
        A: 'x = 7',
        B: 'x = 4',
        C: 'x = 1',
        D: 'x = 14',
      },
      correct_option: 'A',
      explanation: '4x - 2x = 8 + 6 -> 2x = 14 -> x = 7.',
    },
    {
      question_text: 'Harga 3 buah buku dan 2 buah pensil adalah Rp 17.000. Jika harga 1 buku dimisalkan dengan <strong>b</strong> dan harga 1 pensil dimisalkan dengan <strong>p</strong>, maka model matematika aljabar yang tepat adalah...',
      image_index: null,
      options: {
        A: '3b + 2p = 17.000',
        B: '2b + 3p = 17.000',
        C: '5(b + p) = 17.000',
        D: '3b - 2p = 17.000',
      },
      correct_option: 'A',
      explanation: '3 buku (3b) dan 2 pensil (2p) bernilai 17.000, model aljabarnya adalah 3b + 2p = 17.000.',
    },
    {
      question_text: 'Sebuah persegi panjang memiliki panjang <strong>(x + 5) cm</strong> dan lebar <strong>(x - 2) cm</strong>. Bentuk aljabar untuk keliling persegi panjang tersebut adalah...',
      image_index: null,
      options: {
        A: '4x + 6 cm',
        B: '2x + 3 cm',
        C: '4x + 3 cm',
        D: 'x² + 3x - 10 cm',
      },
      correct_option: 'A',
      explanation: 'Keliling = 2 * (p + l) = 2 * ((x + 5) + (x - 2)) = 2 * (2x + 3) = 4x + 6 cm.',
    },
  ],
};

/**
 * Mencari preset topik terdekat berdasarkan kata kunci
 */
function findMatchingPreset(topic: string, subject: string): GeneratedQuestionItem[] | null {
  const normalized = `${topic} ${subject}`.toLowerCase();

  // 1. Cek kata kunci TATA SURYA / IPA
  if (
    normalized.includes('tata surya') ||
    normalized.includes('planet') ||
    normalized.includes('astronomi') ||
    normalized.includes('matahari') ||
    normalized.includes('bulan') ||
    normalized.includes('bintang') ||
    normalized.includes('bumi') ||
    normalized.includes('gerhana')
  ) {
    return TOPIC_PRESETS['tata surya'];
  }

  // 2. Cek kata kunci BERPIKIR KOMPUTASIONAL
  if (
    normalized.includes('berpikir komputasional') ||
    normalized.includes('computational thinking') ||
    normalized.includes('dekomposisi') ||
    normalized.includes('abstraksi') ||
    normalized.includes('algoritma') ||
    normalized.includes('flowchart')
  ) {
    return TOPIC_PRESETS['berpikir komputasional'];
  }

  // 3. Cek kata kunci SISTEM KOMPUTER & HARDWARE
  if (
    normalized.includes('sistem komputer') ||
    normalized.includes('hardware') ||
    normalized.includes('perangkat keras') ||
    normalized.includes('brainware') ||
    normalized.includes('processor') ||
    normalized.includes('input device') ||
    normalized.includes('output device') ||
    normalized.includes('memori')
  ) {
    return TOPIC_PRESETS['sistem komputer'];
  }

  // 4. Cek kata kunci JARINGAN KOMPUTER & INTERNET
  if (
    normalized.includes('jaringan') ||
    normalized.includes('router') ||
    normalized.includes('lan') ||
    normalized.includes('wan') ||
    normalized.includes('wifi') ||
    normalized.includes('topologi') ||
    normalized.includes('ip address') ||
    normalized.includes('internet')
  ) {
    return TOPIC_PRESETS['jaringan komputer'];
  }

  // 5. Cek kata kunci EKOSISTEM & LINGKUNGAN
  if (
    normalized.includes('ekosistem') ||
    normalized.includes('rantai makanan') ||
    normalized.includes('simbiosis') ||
    normalized.includes('biotik') ||
    normalized.includes('abiotik') ||
    normalized.includes('lingkungan') ||
    normalized.includes('konsumen') ||
    normalized.includes('produsen')
  ) {
    return TOPIC_PRESETS['ekosistem'];
  }

  // 6. Cek kata kunci MATEMATIKA & ALJABAR
  if (
    normalized.includes('aljabar') ||
    normalized.includes('persamaan') ||
    normalized.includes('variabel') ||
    normalized.includes('koefisien') ||
    normalized.includes('faktorisasi') ||
    normalized.includes('matematika')
  ) {
    return TOPIC_PRESETS['aljabar'];
  }

  for (const key in TOPIC_PRESETS) {
    if (normalized.includes(key)) {
      return TOPIC_PRESETS[key];
    }
  }

  return null;
}

/**
 * Sintesis cerdas butir soal dari literatur internet mendalam untuk topik umum lainnya
 */
function synthesizeQuestionsFromDeepLiterature(
  subject: string,
  gradeLevel: string,
  classGrade: string,
  topic: string,
  count: number,
  extractedMaterialText: string,
  internetSummary: string,
  keyTerms: string[] = [],
  extractedFacts: string[] = []
): GeneratedQuestionItem[] {
  const cleanTopic = topic.replace(/BAB\s*\d+\s*:?/gi, '').replace(/[-_]/g, ' ').trim();
  const allText = `${extractedMaterialText} ${internetSummary}`;

  // Kumpulkan istilah penting
  const terms = Array.from(new Set([...keyTerms, cleanTopic]))
    .filter((t) => t && t.length > 3 && !t.includes('http') && !t.includes('hlm'))
    .slice(0, 15);

  const t1 = terms[0] || cleanTopic;
  const t2 = terms[1] || 'Sistem Terkait';
  const t3 = terms[2] || 'Prinsip Dasar';
  const t4 = terms[3] || 'Karakteristik Komponen';

  const generatedList: GeneratedQuestionItem[] = [];

  // Saring fakta agar tidak memuat biografi tokoh atau sejarah jika mata pelajaran adalah Matematika/Sains/Informatika
  const validFacts = (extractedFacts || []).filter((fact) => {
    if (
      subject.toLowerCase().includes('matematika') ||
      subject.toLowerCase().includes('ipa') ||
      subject.toLowerCase().includes('fisika') ||
      subject.toLowerCase().includes('kimia') ||
      subject.toLowerCase().includes('informatika')
    ) {
      return !/\b(khalifah|abbasiyah|dinasti|kerajaan|masehi|hijriyah|makam|wafat|lahir pada|berkebangsaan|polimat|filsuf|sejarawan|mutawakkil|al-rashid)\b/i.test(
        fact
      );
    }
    return true;
  });

  // Jika ada fakta-fakta spesifik yang berhasil diekstraksi dari ensiklopedia
  if (validFacts && validFacts.length >= 5) {
    for (let i = 0; i < Math.min(validFacts.length, count); i++) {
      const fact = validFacts[i];
      const factClean = fact.replace(/\s+/g, ' ').trim();

      // Buat pertanyaan pemahaman dari kalimat fakta
      generatedList.push({
        question_text: `Berdasarkan kajian materi <strong>${cleanTopic}</strong>, pernyataan ilmiah berikut yang paling tepat adalah...`,
        image_index: null,
        options: {
          A: `${factClean}`,
          B: `${factClean.replace(/\b(adalah|merupakan|memiliki|terdiri)\b/gi, 'bukan merupakan')}`,
          C: `Konsep ${cleanTopic} tidak memiliki dasar ilmiah yang dapat dibuktikan`,
          D: `Seluruh komponen dalam ${cleanTopic} selalu memiliki fungsi yang sama persis`,
        },
        correct_option: 'A',
        explanation: `Sesuai literatur resmi materi kurikulum, ${factClean}`,
      });
    }
  }

  // Lengkapi dengan pertanyaan kontekstual dan analitis yang lugas
  const coreTemplates = [
    {
      q: `Konsep atau pilar esensial yang dipelajari dalam materi <strong>${cleanTopic}</strong> pada mata pelajaran ${subject} adalah...`,
      correct: `${t1}`,
      distractors: ['Pencatatan fiktif', 'Penghapusan data secara acak', 'Prosedur tanpa evaluasi'],
      exp: `${t1} merupakan pilar atau konsep utama dalam pembelajaran ${cleanTopic}.`,
    },
    {
      q: `Tujuan utama mempelajari topik <strong>${cleanTopic}</strong> dalam kehidupan nyata adalah...`,
      correct: `Mampu memahami prinsip kerja, karakteristik, dan menyelesaikan permasalahan secara terstruktur`,
      distractors: [
        'Menghafal rumus tanpa memahami penerapan praktisnya',
        'Mengabaikan keselamatan dan prosedur yang berlaku',
        'Menghindari analisis data secara ilmiah',
      ],
      exp: `Pembelajaran ${cleanTopic} bertujuan menanamkan pemahaman komprehensif dan kemampuan problem solving.`,
    },
    {
      q: `Keterkaitan antara <strong>${t1}</strong> dan <strong>${t2}</strong> dalam kajian materi ${cleanTopic} yang paling benar adalah...`,
      correct: `Keduanya saling berkaitan erat dan bekerja sama dalam satu kesatuan sistem`,
      distractors: [
        'Keduanya saling menolak dan tidak dapat digabungkan',
        'Satu komponen menghilangkan fungsi komponen lainnya secara total',
        'Keduanya hanya berfungsi jika terjadi kerusakan sistem',
      ],
      exp: `Dalam materi ${cleanTopic}, setiap elemen saling mendukung kinerja keseluruhan sistem.`,
    },
    {
      q: `Ciri khas atau karakteristik utama yang membedakan <strong>${t1}</strong> dengan konsep lainnya adalah...`,
      correct: `Memiliki fungsi dan peran spesifik yang mendukung tercapainya tujuan sistem secara optimal`,
      distractors: [
        'Tidak memiliki peran atau pengaruh apa pun dalam sistem',
        'Hanya digunakan sebagai hiasan teoritis tanpa fungsi nyata',
        'Dapat digantikan sepenuhnya oleh elemen acak mana pun',
      ],
      exp: `${t1} memiliki identitas dan peran fungsional yang unik dalam materi ${cleanTopic}.`,
    },
    {
      q: `Langkah evaluasi yang paling tepat ketika menerapkan konsep <strong>${cleanTopic}</strong> adalah...`,
      correct: `Menganalisis hasil kerja secara teliti dan menguji kesesuaian dengan standar yang ditentukan`,
      distractors: [
        'Mengabaikan data pengukuran yang tidak sesuai keinginan',
        'Menyimpulkan hasil sebelum pengamatan selesai dilakukan',
        'Menerima kesalahan tanpa melakukan perbaikan langkah kerja',
      ],
      exp: `Evaluasi yang benar selalu didasarkan pada data empiris dan pengujian terukur.`,
    },
  ];

  let tIdx = 0;
  while (generatedList.length < count) {
    const tpl = coreTemplates[tIdx % coreTemplates.length];
    tIdx++;

    generatedList.push({
      question_text: tpl.q,
      image_index: null,
      options: {
        A: tpl.correct,
        B: tpl.distractors[0],
        C: tpl.distractors[1],
        D: tpl.distractors[2],
      },
      correct_option: 'A',
      explanation: tpl.exp,
    });
  }

  return generatedList.slice(0, count);
}

/**
 * Fungsi Utama: Menghasilkan Soal CBT yang Normal, Jelas, Terhubung, dan Sesuai Kurikulum
 */
export function generateIntelligentContextualQuestions(
  subject: string,
  gradeLevel: string,
  classGrade: string,
  topic: string,
  count: number,
  extractedMaterialText: string,
  internetSummary: string,
  availableImagesCount: number,
  keyTerms: string[] = [],
  extractedFacts: string[] = []
): GeneratedQuestionItem[] {
  // 1. Cek apakah ada preset topik kurikulum yang cocok (seperti Tata Surya, Berpikir Komputasional, Sistem Komputer, dll.)
  const preset = findMatchingPreset(topic, subject);
  if (preset && preset.length > 0) {
    const list: GeneratedQuestionItem[] = [];
    for (let i = 0; i < count; i++) {
      const q = preset[i % preset.length];
      list.push({
        ...q,
        // Pastikan image_index hanya diisi jika materi memiliki gambar asli yang valid
        image_index: q.image_index !== null && availableImagesCount > 0 ? 0 : null,
      });
    }
    return list;
  }

  // 2. Jika bukan preset langsung, gunakan sintesis literatur ilmiah mendalam dari internet
  return synthesizeQuestionsFromDeepLiterature(
    subject,
    gradeLevel,
    classGrade,
    topic,
    count,
    extractedMaterialText,
    internetSummary,
    keyTerms,
    extractedFacts
  );
}
