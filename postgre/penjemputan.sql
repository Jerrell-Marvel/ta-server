INSERT INTO Penjemputan (id_siswa, tanggal, status)
SELECT 
    id_siswa, 
    CURRENT_DATE, 
    'menunggu penjemputan'
FROM 
    Siswa
WHERE 
    is_active = TRUE
ON CONFLICT (id_siswa, tanggal) DO NOTHING;