// ============================================================
// prisma/seed.js — Database seeding using Prisma Client
// Seeds 15 master komoditas and initial prices
// ============================================================
import { PrismaClient } from '@prisma/client';

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

const hargaPlaceholder = {
  'Cabai rawit': 85000,
  'Cabai merah': 65000,
  'Bawang merah': 40000,
  'Tomat': 14000,
  'Bayam': 12000,
  'Kangkung': 10000,
  'Selada': 25000,
  'Sawi': 12000,
  'Wortel': 18000,
  'Terong': 15000,
  'Kacang panjang': 14000,
  'Mentimun': 10000,
  'Pare': 12000,
  'Kemangi': 30000,
  'Daun bawang': 20000,
};

async function main() {
  console.log('🌱 Starting Prisma seeding...\n');

  for (const item of komoditasData) {
    const komoditas = await prisma.komoditas.upsert({
      where: { nama: item.nama },
      update: item,
      create: item,
    });

    const harga = hargaPlaceholder[item.nama] || 15000;

    await prisma.hargaKomoditas.create({
      data: {
        komoditasId: komoditas.id,
        hargaRpPerKg: harga,
        sumber: 'BAPANAS',
        tanggalUpdate: new Date('2026-09-28'),
        wilayah: 'Yogyakarta',
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
