-- ============================================================
-- Seed 001: Dummy Komoditas (15 item)
-- ⚠️ Data ini PLACEHOLDER — akan diganti seed final dari AI/Data Engineer
-- Sumber daftar komoditas: SSOT §5
-- ============================================================

INSERT INTO komoditas (nama, kebutuhan_sinar, luas_min_m2, luas_optimal_m2, waktu_panen_hari, konsumsi_rt_kg_per_bulan, tingkat_kesulitan, jadwal_siram_hari, jadwal_pupuk_hari, panduan_singkat)
VALUES
  ('Cabai rawit',     'FULL_SUN',    0.50, 1.50, 75, 0.50, 'SEDANG', 1, 14, 'Tanam di area sinar penuh. Siram setiap hari pagi/sore. Pupuk NPK tiap 2 minggu.'),
  ('Cabai merah',     'FULL_SUN',    0.50, 1.50, 80, 0.40, 'SEDANG', 1, 14, 'Mirip cabai rawit tapi butuh sedikit lebih lama. Jaga kelembaban tanah.'),
  ('Bawang merah',    'FULL_SUN',    0.25, 0.75, 60, 0.80, 'SEDANG', 2, 14, 'Tanam umbi di tanah gembur. Tidak terlalu banyak air. Sinar penuh.'),
  ('Tomat',           'FULL_SUN',    0.50, 1.00, 70, 1.00, 'SEDANG', 1, 14, 'Butuh ajir/tongkat penopang. Siram teratur, hindari genangan.'),
  ('Bayam',           'PARTIAL_SUN', 0.25, 0.50, 25, 1.50, 'MUDAH',  1,  7, 'Salah satu sayuran termudah. Tumbuh cepat, bisa dipanen berkali-kali.'),
  ('Kangkung',        'PARTIAL_SUN', 0.25, 0.50, 25, 1.50, 'MUDAH',  1,  7, 'Sangat mudah ditanam. Bisa di pot/polybag kecil. Panen 3-4 minggu.'),
  ('Selada',          'PARTIAL_SUN', 0.25, 0.50, 30, 0.50, 'MUDAH',  1,  7, 'Cocok di tempat teduh parsial. Jaga tanah tetap lembab.'),
  ('Sawi',            'PARTIAL_SUN', 0.25, 0.50, 30, 1.00, 'MUDAH',  1,  7, 'Tumbuh cepat seperti bayam. Panen daun luar dulu.'),
  ('Wortel',          'FULL_SUN',    0.25, 0.75, 75, 0.80, 'SEDANG', 2, 14, 'Butuh tanah gembur dalam (min 20cm). Tidak cocok pot dangkal.'),
  ('Terong',          'FULL_SUN',    0.50, 1.00, 70, 0.60, 'SEDANG', 1, 14, 'Butuh sinar penuh dan ajir. Rentan hama kutu daun.'),
  ('Kacang panjang',  'FULL_SUN',    0.50, 1.00, 45, 0.80, 'MUDAH',  1, 14, 'Butuh rambatan/ajir tinggi. Panen bertahap.'),
  ('Mentimun',        'FULL_SUN',    0.50, 1.50, 40, 0.80, 'MUDAH',  1, 14, 'Tumbuh merambat, butuh space. Panen cepat.'),
  ('Pare',            'FULL_SUN',    0.50, 1.50, 45, 0.30, 'MUDAH',  1, 14, 'Tumbuh merambat. Kuat terhadap hama. Konsumsi RT relatif rendah.'),
  ('Kemangi',         'PARTIAL_SUN', 0.25, 0.50, 30, 0.30, 'MUDAH',  1,  7, 'Sangat mudah. Bisa ditanam di pot kecil. Panen petik daun.'),
  ('Daun bawang',     'PARTIAL_SUN', 0.25, 0.50, 45, 0.40, 'MUDAH',  2, 14, 'Tanam dari potongan akar bawang dapur. Tumbuh ulang setelah dipotong.')
ON CONFLICT (nama) DO NOTHING;
