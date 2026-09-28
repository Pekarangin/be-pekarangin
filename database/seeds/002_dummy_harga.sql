-- ============================================================
-- Seed 002: Dummy Harga Komoditas
-- ⚠️ Data ini PLACEHOLDER — akan diupdate mingguan dari Bapanas/PIHPS
-- Harga dalam Rp/kg, wilayah pilot: Yogyakarta
-- ============================================================

-- Ambil komoditas_id dari tabel komoditas berdasarkan nama
-- Harga ini adalah perkiraan kasar, BUKAN data riil Bapanas

TRUNCATE TABLE harga_komoditas CASCADE;

INSERT INTO harga_komoditas (komoditas_id, harga_rp_per_kg, sumber, tanggal_update, wilayah)
SELECT id, 85000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Cabai rawit'
UNION ALL
SELECT id, 65000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Cabai merah'
UNION ALL
SELECT id, 40000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Bawang merah'
UNION ALL
SELECT id, 14000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Tomat'
UNION ALL
SELECT id, 12000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Bayam'
UNION ALL
SELECT id, 10000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Kangkung'
UNION ALL
SELECT id, 25000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Selada'
UNION ALL
SELECT id, 12000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Sawi'
UNION ALL
SELECT id, 18000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Wortel'
UNION ALL
SELECT id, 15000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Terong'
UNION ALL
SELECT id, 14000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Kacang panjang'
UNION ALL
SELECT id, 10000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Mentimun'
UNION ALL
SELECT id, 12000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Pare'
UNION ALL
SELECT id, 30000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Kemangi'
UNION ALL
SELECT id, 20000,  'BAPANAS', '2026-09-28'::DATE, 'Yogyakarta' FROM komoditas WHERE nama = 'Daun bawang';
