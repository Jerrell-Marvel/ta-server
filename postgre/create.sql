CREATE TABLE Admin (
    id_admin INT PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Guru (
    id_guru INT PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    url_foto VARCHAR(255) NOT NULL,
    notification_id VARCHAR(255)
);

CREATE TABLE Kelas (
    id_kelas INT PRIMARY KEY NOT NULL,
    nomor_kelas INT NOT NULL,
    varian_kelas CHAR(1) NOT NULL,
    id_guru INT,
    CONSTRAINT fk_id_guru FOREIGN KEY (id_guru) REFERENCES Guru (id_guru)
);

CREATE TABLE Siswa (
    id_siswa INT PRIMARY KEY NOT NULL,
    nama VARCHAR(255) NOT NULL,
    url_foto VARCHAR(255) NOT NULL,
    id_kelas INT,
    CONSTRAINT fk_id_kelas FOREIGN KEY (id_kelas) REFERENCES Kelas (id_kelas)
);

CREATE TABLE Penjemput (
    id_penjemput INT PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    url_foto VARCHAR(255) NOT NULL,
    id_murid INT,
    public_key VARCHAR(255),
    CONSTRAINT fk_id_murid FOREIGN KEY (id_murid) REFERENCES Siswa (id_siswa)
);

CREATE TABLE Penjemputan (
    id_penjemputan INT PRIMARY KEY NOT NULL,
    id_siswa INT NOT NULL,
    status VARCHAR(100) NOT NULL,
    tanggal_penjemputan DATE NOT NULL,
    id_penjemput INT,
    CONSTRAINT fk_id_siswa FOREIGN KEY (id_siswa) REFERENCES Siswa (id_siswa),
    CONSTRAINT fk_id_penjemput FOREIGN KEY (id_penjemput) REFERENCES Penjemput (id_penjemput)
);