// ============================================================
// prisma/seed.js — Database seeding using Prisma Client
// Seeds 15 master komoditas and initial prices
// ============================================================
import { PrismaClient } from '@prisma/client';
import { getDefaultKomoditasImage } from '../src/utils/constants.js';

const prisma = new PrismaClient();

const komoditasData = [
  { nama: 'Cabai rawit', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.50, luasOptimalM2: 1.50, waktuPanenHari: 75, konsumsiRtKgPerBulan: 0.50, tingkatKesulitan: 'SEDANG', jadwalSiramHari: 1, jadwalPupukHari: 14, panduanSingkat: 'Tanam di area sinar penuh. Siram setiap hari pagi/sore. Pupuk NPK tiap 2 minggu.' },
  { nama: 'Cabai merah', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.50, luasOptimalM2: 1.50, waktuPanenHari: 80, konsumsiRtKgPerBulan: 0.40, tingkatKesulitan: 'SEDANG', jadwalSiramHari: 1, jadwalPupukHari: 14, panduanSingkat: 'Mirip cabai rawit tapi butuh sedikit lebih lama. Jaga kelembaban tanah.' },
  { nama: 'Bawang merah', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.75, waktuPanenHari: 60, konsumsiRtKgPerBulan: 0.80, tingkatKesulitan: 'SEDANG', jadwalSiramHari: 2, jadwalPupukHari: 14, panduanSingkat: 'Tanam umbi di tanah gembur. Tidak terlalu banyak air. Sinar penuh.' },
  { nama: 'Tomat', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.50, luasOptimalM2: 1.00, waktuPanenHari: 70, konsumsiRtKgPerBulan: 1.00, tingkatKesulitan: 'SEDANG', jadwalSiramHari: 1, jadwalPupukHari: 14, panduanSingkat: 'Butuh ajir/tongkat penopang. Siram teratur, hindari genangan.' },
  { nama: 'Bayam', kebutuhanSinar: 'PARTIAL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.50, waktuPanenHari: 25, konsumsiRtKgPerBulan: 1.50, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 7, panduanSingkat: 'Salah satu sayuran termudah. Tumbuh cepat, bisa dipanen berkali-kali.' },
  { nama: 'Kangkung', kebutuhanSinar: 'PARTIAL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.50, waktuPanenHari: 25, konsumsiRtKgPerBulan: 1.50, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 7, panduanSingkat: 'Sangat mudah ditanam. Bisa di pot/polybag kecil. Panen 3-4 minggu.' },
  { nama: 'Selada', kebutuhanSinar: 'PARTIAL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.50, waktuPanenHari: 30, konsumsiRtKgPerBulan: 0.50, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 7, panduanSingkat: 'Cocok di tempat teduh parsial. Jaga tanah tetap lembab.' },
  { nama: 'Sawi', kebutuhanSinar: 'PARTIAL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.50, waktuPanenHari: 30, konsumsiRtKgPerBulan: 1.00, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 7, panduanSingkat: 'Tumbuh cepat seperti bayam. Panen daun luar dulu.' },
  { nama: 'Wortel', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.75, waktuPanenHari: 75, konsumsiRtKgPerBulan: 0.80, tingkatKesulitan: 'SEDANG', jadwalSiramHari: 2, jadwalPupukHari: 14, panduanSingkat: 'Butuh tanah gembur dalam (min 20cm). Tidak cocok pot dangkal.' },
  { nama: 'Terong', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.50, luasOptimalM2: 1.00, waktuPanenHari: 70, konsumsiRtKgPerBulan: 0.60, tingkatKesulitan: 'SEDANG', jadwalSiramHari: 1, jadwalPupukHari: 14, panduanSingkat: 'Butuh sinar penuh dan ajir. Rentan hama kutu daun.' },
  { nama: 'Kacang panjang', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.50, luasOptimalM2: 1.00, waktuPanenHari: 45, konsumsiRtKgPerBulan: 0.80, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 14, panduanSingkat: 'Butuh rambatan/ajir tinggi. Panen bertahap.' },
  { nama: 'Mentimun', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.50, luasOptimalM2: 1.50, waktuPanenHari: 40, konsumsiRtKgPerBulan: 0.80, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 14, panduanSingkat: 'Tumbuh merambat, butuh space. Panen cepat.' },
  { nama: 'Pare', kebutuhanSinar: 'FULL_SUN', luasMinM2: 0.50, luasOptimalM2: 1.50, waktuPanenHari: 45, konsumsiRtKgPerBulan: 0.30, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 14, panduanSingkat: 'Tumbuh merambat. Kuat terhadap hama. Konsumsi RT relatif rendah.' },
  { nama: 'Kemangi', kebutuhanSinar: 'PARTIAL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.50, waktuPanenHari: 30, konsumsiRtKgPerBulan: 0.30, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 1, jadwalPupukHari: 7, panduanSingkat: 'Sangat mudah. Bisa ditanam di pot kecil. Panen petik daun.' },
  { nama: 'Daun bawang', kebutuhanSinar: 'PARTIAL_SUN', luasMinM2: 0.25, luasOptimalM2: 0.50, waktuPanenHari: 45, konsumsiRtKgPerBulan: 0.40, tingkatKesulitan: 'MUDAH', jadwalSiramHari: 2, jadwalPupukHari: 14, panduanSingkat: 'Tanam dari potongan akar bawang dapur. Tumbuh ulang setelah dipotong.' },
];

const hargaSleman = {
  'Cabai rawit': 68857,
  'Cabai merah': 67571,
  'Bawang merah': 30714,
  'Bayam': 10000,
  'Wortel': 14286,
  'Selada': 22000,
  'Kangkung': 6500,
  'Mentimun': 10857,
  'Tomat': 8286,
  'Kemangi': 25000,
  'Terong': 12000,
  'Daun bawang': 18000,
  'Sawi': 7071,
  'Kacang panjang': 8500,
  'Pare': 11000,
};

async function main() {
  console.log('🌱 Starting Prisma seeding...\n');

  for (const item of komoditasData) {
    const dataWithImg = {
      ...item,
      imageUrl: getDefaultKomoditasImage(item.nama),
    };
    const komoditas = await prisma.komoditas.upsert({
      where: { nama: item.nama },
      update: dataWithImg,
      create: dataWithImg,
    });

    const harga = hargaSleman[item.nama] || 15000;

    await prisma.hargaKomoditas.create({
      data: {
        komoditasId: komoditas.id,
        hargaRpPerKg: harga,
        sumber: 'SLEMAN_DISPERINDAG',
        tanggalUpdate: new Date('2026-10-13'),
        wilayah: 'Sleman',
      },
    });
  }

  console.log('✅ Seed completed: 15 komoditas & harga successfully populated.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
