// ============================================================
// src/services/aiInsight.service.js — AI Insight & Chatbot Service
// Menghubungkan Backend Express ke AI Microservice (FastAPI) & Gemini
// Sumber: API_Contract_Pekarangin.md §5 & SSOT.md §3 (Fase 5)
// ============================================================
import prisma from '../config/database.js';
import env from '../config/env.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { calculateHariKe } from './tracking.service.js';

/**
 * Tanya-jawab kontekstual dengan AI Farming Assistant
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.message
 * @param {string} [params.tanamanAktifId]
 * @returns {Promise<{ reply: string, konteks_tanaman: Object | null }>}
 */
export async function chatAssistant({ userId, message, tanamanAktifId }) {
  let konteksTanaman = null;

  // 1. Ambil konteks tanaman jika tanaman_aktif_id disertakan
  if (tanamanAktifId) {
    const tanaman = await prisma.tanamanAktif.findUnique({
      where: { id: tanamanAktifId },
      include: {
        komoditas: true,
      },
    });

    if (!tanaman) {
      throw new NotFoundError('Tanaman aktif tidak ditemukan');
    }

    if (tanaman.userId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses ke data tanaman ini');
    }

    const hariKe = calculateHariKe(tanaman.tanggalTanam);
    konteksTanaman = {
      nama: tanaman.komoditas.nama,
      hari_ke: hariKe,
      status: tanaman.status,
    };
  }

  // 2. Kirim request ke AI Microservice (FastAPI)
  try {
    const aiUrl = `${env.aiServiceUrl.replace(/\/$/, '')}/api/v1/ai/chat`;
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        tanaman_aktif: konteksTanaman,
      }),
      signal: AbortSignal.timeout(15000), // Timeout 15 detik
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return {
          reply: result.data.reply,
          konteks_tanaman: result.data.konteks_tanaman || konteksTanaman,
        };
      }
    }
  } catch (err) {
    console.warn(`[AI Proxy Warning] Gagal menghubungi AI Microservice di ${env.aiServiceUrl}: ${err.message}. Menggunakan fallback cerdas.`);
  }

  // 3. Fallback Cerdas (Agronomi Urban) jika AI Microservice sedang offline/timeout
  const tNama = konteksTanaman ? konteksTanaman.nama : 'tanaman Anda';
  const tHari = konteksTanaman ? `pada fase pertumbuhan (hari ke-${konteksTanaman.hari_ke})` : 'di pekarangan Anda';

  const fallbackReply =
    `Halo Sobat Pekarang! Untuk ${tNama} ${tHari}, kendala umum seperti daun menguning atau pertumbuhan lambat biasanya disebabkan oleh kelembaban media tanam yang berlebih atau kekurangan unsur hara Nitrogen (N). ` +
    `Periksa kelembaban tanah dengan menusukkan jari sedalam 2 cm sebelum menyiram, dan berikan pupuk NPK seimbang atau pupuk organik cair sesuai jadwal perawatan berkala. ` +
    `Pastikan juga tanaman tetap mendapatkan paparan sinar matahari dan sirkulasi udara yang optimal.`;

  return {
    reply: fallbackReply,
    konteks_tanaman: konteksTanaman,
  };
}
