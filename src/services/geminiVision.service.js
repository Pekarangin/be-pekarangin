// ============================================================
// src/services/geminiVision.service.js — Gemini Vision Proxy
// Klasifikasi paparan sinar lahan dari foto (zero-shot)
// ============================================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import { AppError } from '../utils/errors.js';

let genAI = null;
if (env.geminiApiKey) {
  genAI = new GoogleGenerativeAI(env.geminiApiKey);
}

/**
 * Menganalisis foto lahan untuk menentukan klasifikasi paparan sinar matahari
 * @param {Buffer} imageBuffer - Buffer data gambar
 * @param {string} mimeType - Tipe MIME gambar (image/jpeg, image/png, dll)
 * @returns {Promise<{ paparan_sinar: string, confidence: number, catatan: string }>}
 */
export async function analyzeSunlightFromImage(imageBuffer, mimeType = 'image/jpeg') {
  if (!env.geminiApiKey) {
    // Mode fallback jika API Key belum diisi (memudahkan testing lokal / CI)
    return {
      paparan_sinar: 'PARTIAL_SUN',
      confidence: 0.85,
      catatan: 'Mode dev/fallback: Terdeteksi pencahayaan parsial (atur GEMINI_API_KEY untuk hasil riil Gemini Vision)',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Anda adalah asisten cerdas agronomi untuk aplikasi smart urban farming Pekarang.in.
Analisis foto area pekarangan/lahan ini untuk menentukan paparan sinar matahari untuk pertanian perkotaan.
Kategorikan tingkat paparan sinar matahari ke dalam salah satu dari 3 kategori berikut:
- FULL_SUN: Area terbuka yang mendapat sinar matahari langsung minimal 6 jam sehari (terik, minim naungan).
- PARTIAL_SUN: Area yang mendapat sinar matahari langsung 3 hingga 6 jam sehari (ternaungi sebagian pohon/tembok, atau teduh parsial).
- SHADE: Area teduh yang mendapat sinar matahari langsung kurang dari 3 jam sehari (sangat ternaungi tembok tinggi, lorong sempit, kanopi rapat).

KEMBALIKAN HANYA sebuah string JSON murni tanpa markdown triple-backtick dengan format berikut:
{
  "paparan_sinar": "FULL_SUN" | "PARTIAL_SUN" | "SHADE",
  "confidence": 0.85,
  "catatan": "Penjelasan singkat 1-2 kalimat dalam Bahasa Indonesia mengenai kondisi bayangan atau pencahayaan yang terdeteksi."
}`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim();

    // Hapus code block format markdown jika ada
    const cleanedText = responseText
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    const validPaparan = ['FULL_SUN', 'PARTIAL_SUN', 'SHADE'];
    const paparan_sinar = validPaparan.includes(parsed.paparan_sinar)
      ? parsed.paparan_sinar
      : 'PARTIAL_SUN';
    const confidence =
      typeof parsed.confidence === 'number'
        ? Math.min(Math.max(parsed.confidence, 0), 1)
        : 0.8;
    const catatan = parsed.catatan || 'Analisis citra paparan sinar selesai';

    return {
      paparan_sinar,
      confidence: Math.round(confidence * 100) / 100,
      catatan,
    };
  } catch (err) {
    console.error('Gemini Vision API error:', err.message);
    throw new AppError(`Gagal menganalisis citra lahan: ${err.message}`, 502, 'EXTERNAL_AI_ERROR');
  }
}
