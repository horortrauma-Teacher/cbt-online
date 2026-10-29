import zlib from 'zlib';

export interface ExtractedMedia {
  filename: string;
  mimeType: string;
  dataUrl: string;
}

export interface PPTXExtractionResult {
  images: ExtractedMedia[];
  slideTexts: string[];
  fullText: string;
}

/**
 * Ekstraksi lengkap dari file presentasi PowerPoint (.pptx):
 * - Gambar slide asli di folder 'ppt/media/'
 * - Teks materi dari setiap slide di 'ppt/slides/slide*.xml'
 */
export function extractPPTXContent(buffer: Buffer): PPTXExtractionResult {
  const images: ExtractedMedia[] = [];
  const slideMap = new Map<number, string>();
  let offset = 0;

  try {
    while (offset < buffer.length - 30) {
      // Cari signature Local File Header ZIP: 0x04034b50 ("PK\x03\x04")
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compMethod = buffer.readUInt16LE(offset + 8);
        const compSize = buffer.readUInt32LE(offset + 18);
        const fileNameLen = buffer.readUInt16LE(offset + 26);
        const extraFieldLen = buffer.readUInt16LE(offset + 28);

        const fileNameStart = offset + 30;
        const fileNameEnd = fileNameStart + fileNameLen;
        const fileName = buffer.toString('utf-8', fileNameStart, fileNameEnd);

        const dataStart = fileNameEnd + extraFieldLen;
        const dataEnd = dataStart + compSize;

        if (dataEnd <= buffer.length) {
          const rawData = buffer.subarray(dataStart, dataEnd);

          // 1. Ekstraksi Gambar dari slide
          if (
            fileName.startsWith('ppt/media/') &&
            /\.(png|jpe?g|gif|webp)$/i.test(fileName)
          ) {
            let decompressed: Buffer | null = null;
            try {
              if (compMethod === 8) {
                decompressed = zlib.inflateRawSync(rawData);
              } else if (compMethod === 0) {
                decompressed = rawData;
              }
            } catch (e) {}

            // Filter gambar: abaikan icon/tombol kecil (harus >= 6 KB agar bukan icon UI)
            if (decompressed && decompressed.length >= 6000) {
              let mime = 'image/png';
              if (/\.jpe?g$/i.test(fileName)) mime = 'image/jpeg';
              if (/\.webp$/i.test(fileName)) mime = 'image/webp';

              images.push({
                filename: fileName.replace('ppt/media/', ''),
                mimeType: mime,
                dataUrl: `data:${mime};base64,${decompressed.toString('base64')}`,
              });
            }
          }

          // 2. Ekstraksi Teks Asli dari setiap slide (ppt/slides/slide1.xml, slide2.xml, dst.)
          const slideMatch = fileName.match(/^ppt\/slides\/slide(\d+)\.xml$/);
          if (slideMatch) {
            const slideIndex = parseInt(slideMatch[1], 10);
            let decompressed: Buffer | null = null;
            try {
              if (compMethod === 8) {
                decompressed = zlib.inflateRawSync(rawData);
              } else if (compMethod === 0) {
                decompressed = rawData;
              }
            } catch (e) {}

            if (decompressed) {
              const xmlContent = decompressed.toString('utf-8');
              // Ekstraksi seluruh tag teks <a:t>...</a:t>
              const matches = xmlContent.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g);
              if (matches && matches.length > 0) {
                const text = matches
                  .map((m) => m.replace(/<[^>]+>/g, '').trim())
                  .filter((t) => t.length > 0)
                  .join(' ');
                if (text.length > 0) {
                  slideMap.set(slideIndex, text);
                }
              }
            }
          }
        }

        offset = dataStart + compSize;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.warn('Gagal ekstraksi konten dari PPTX:', err);
  }

  // Susun teks slide sesuai urutan slide 1, 2, 3...
  const sortedSlideIndices = Array.from(slideMap.keys()).sort((a, b) => a - b);
  const slideTexts = sortedSlideIndices.map(
    (idx) => `[SLIDE ${idx}]: ${slideMap.get(idx)}`
  );
  const fullText = slideTexts.join('\n\n');

  return {
    images,
    slideTexts,
    fullText,
  };
}

/**
 * Kompatibilitas mundur untuk ekstraksi gambar saja
 */
export function extractImagesFromPPTX(buffer: Buffer): ExtractedMedia[] {
  return extractPPTXContent(buffer).images;
}

/**
 * Ekstraksi gambar JPEG asli yang tersemat di dalam dokumen PDF.
 */
export function extractImagesFromPDF(buffer: Buffer): ExtractedMedia[] {
  const images: ExtractedMedia[] = [];
  let offset = 0;

  try {
    // Pindai stream JPEG header: 0xFFD8...0xFFD9
    while (offset < buffer.length - 10 && images.length < 10) {
      if (
        buffer[offset] === 0xff &&
        buffer[offset + 1] === 0xd8 &&
        buffer[offset + 2] === 0xff
      ) {
        const start = offset;
        let end = -1;
        for (let j = start + 4; j < buffer.length - 1 && j < start + 3000000; j++) {
          if (buffer[j] === 0xff && buffer[j + 1] === 0xd9) {
            end = j + 2;
            break;
          }
        }

        if (end > start && end - start > 2000) {
          const imgBuf = buffer.subarray(start, end);
          images.push({
            filename: `pdf_img_${images.length + 1}.jpg`,
            mimeType: 'image/jpeg',
            dataUrl: `data:image/jpeg;base64,${imgBuf.toString('base64')}`,
          });
          offset = end;
          continue;
        }
      }
      offset++;
    }
  } catch (err) {
    console.warn('Gagal ekstraksi gambar dari PDF:', err);
  }

  return images;
}

/**
 * Ekstraksi teks dari dokumen PDF (mendukung teks latin dan block teks BT..ET)
 */
export function extractTextFromPDF(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1');
    const textPieces: string[] = [];

    // Cari blok Text Object PDF: BT ... ET
    const btMatches = raw.match(/BT[\s\S]*?ET/g);
    if (btMatches) {
      for (const block of btMatches) {
        // Ambil string di dalam tanda kurung (teks biasa dalam PDF)
        const strMatches = block.match(/\(([^()]{2,})\)/g);
        if (strMatches) {
          strMatches.forEach((s) => {
            const clean = s.slice(1, -1).trim();
            if (clean.length > 2 && !clean.startsWith('/')) {
              textPieces.push(clean);
            }
          });
        }
      }
    }

    if (textPieces.length > 0) {
      return textPieces.join(' ').replace(/\s+/g, ' ').substring(0, 30000);
    }
  } catch (e) {
    console.warn('Gagal parse teks PDF:', e);
  }
  return '';
}
