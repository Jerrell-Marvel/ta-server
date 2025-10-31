CREATE TYPE user_role AS ENUM ('admin', 'guru', 'penjemput');

CREATE TABLE Users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    url_foto VARCHAR(255),
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE Users
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE Users
DROP CONSTRAINT users_username_key;
CREATE UNIQUE INDEX idx_users_unique_active_username
ON Users (username)
WHERE (is_active = TRUE);

CREATE TABLE Guru (
    id_guru SERIAL PRIMARY KEY,
    id_user INT UNIQUE NOT NULL,
    notification_id VARCHAR(255),
    CONSTRAINT fk_guru_user FOREIGN KEY(id_user) REFERENCES Users(id_user) ON DELETE CASCADE
);
ALTER TABLE Guru
ADD COLUMN nomor_telepon VARCHAR(20);

ALTER TABLE Guru
DROP COLUMN notification_id;
CREATE TABLE NotificationToken (
    id_notification_token SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tokens_user FOREIGN KEY(id_user) REFERENCES Users(id_user) ON DELETE CASCADE
);

CREATE TABLE Kelas (
    id_kelas SERIAL PRIMARY KEY,
    nomor_kelas INT NOT NULL,
    varian_kelas CHAR(1) NOT NULL,
    wali_kelas_id_guru INT,
    CONSTRAINT fk_wali_kelas FOREIGN KEY (wali_kelas_id_guru) REFERENCES Guru (id_guru)
);
ALTER TABLE Kelas
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
-- ALTER TABLE Kelas
-- ADD CONSTRAINT unique_kelas_is_active UNIQUE (nomor_kelas, varian_kelas, is_active);
ALTER TABLE Kelas
ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE Kelas
-- ADD CONSTRAINT check_nomor_kelas_range CHECK (nomor_kelas BETWEEN 1 AND 6);
-- ALTER TABLE Kelas
-- ADD CONSTRAINT check_varian_kelas_lowercase CHECK (varian_kelas ~ '^[a-z]$');

-- ALTER TABLE Kelas
-- DROP CONSTRAINT kelas_nomor_kelas_varian_kelas_key;

-- ALTER TABLE Kelas
-- DROP CONSTRAINT unique_kelas_is_active;

CREATE UNIQUE INDEX idx_kelas_unique_active_class
ON Kelas (nomor_kelas, varian_kelas)
WHERE (is_active = TRUE);

CREATE TABLE Siswa (
    id_siswa SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    url_foto VARCHAR(255) NOT NULL,
    id_kelas INT,
    CONSTRAINT fk_id_kelas FOREIGN KEY (id_kelas) REFERENCES Kelas (id_kelas)
    
);
ALTER TABLE Siswa
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE Siswa
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE Penjemput (
    id_penjemput SERIAL PRIMARY KEY,
    id_user INT UNIQUE NOT NULL,
    public_key TEXT,
    id_siswa INT, 
    CONSTRAINT fk_penjemput_user FOREIGN KEY(id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_penjemput_siswa FOREIGN KEY (id_siswa) REFERENCES Siswa (id_siswa)
);

CREATE TABLE Penjemputan (
    id_penjemputan SERIAL PRIMARY KEY,
    id_siswa INT NOT NULL,
    id_penjemput INT NOT NULL,
    status VARCHAR(100) NOT NULL,
    tanggal_penjemputan TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_penjemputan_siswa FOREIGN KEY (id_siswa) REFERENCES Siswa (id_siswa),
    CONSTRAINT fk_penjemputan_penjemput FOREIGN KEY (id_penjemput) REFERENCES Penjemput (id_penjemput)
);