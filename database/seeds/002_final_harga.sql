-- ============================================================
-- Seed 002: Data Harga Komoditas Terkini (Kabupaten Sleman - 2026-10-13)
-- Disusun otomatis oleh: Scraper Sleman Pekarang.in (ai-pekarangin)
-- Sumber harga: Portal Resmi SIHARPA Disperindag Pemkab Sleman
-- ============================================================

INSERT INTO harga_komoditas (komoditas_id, harga_rp_per_kg, sumber, tanggal_update, wilayah)
SELECT id, 68857, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Cabai rawit'
UNION ALL
SELECT id, 67571, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Cabai merah'
UNION ALL
SELECT id, 30714, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Bawang merah'
UNION ALL
SELECT id, 10000, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Bayam'
UNION ALL
SELECT id, 14286, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Wortel'
UNION ALL
SELECT id, 22000, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Selada'
UNION ALL
SELECT id, 6500, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Kangkung'
UNION ALL
SELECT id, 10857, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Mentimun'
UNION ALL
SELECT id, 8286, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Tomat'
UNION ALL
SELECT id, 25000, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Kemangi'
UNION ALL
SELECT id, 12000, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Terong'
UNION ALL
SELECT id, 18000, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Daun bawang'
UNION ALL
SELECT id, 7071, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Sawi'
UNION ALL
SELECT id, 8500, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Kacang panjang'
UNION ALL
SELECT id, 11000, 'SLEMAN_DISPERINDAG', '2026-10-13'::DATE, 'Sleman' FROM komoditas WHERE nama = 'Pare';
