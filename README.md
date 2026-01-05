
# RAK SKeMe - Sistem Rekod Kokurikulum Digital

Aplikasi pengurusan kokurikulum untuk SK Menerong dengan integrasi GitHub Database & Google Drive.

## 🚀 Langkah 1: Persediaan Awal (Installation)

Jika anda baru clone atau download projek ini, jalankan arahan ini di Terminal:

```bash
npm install
```

## 💻 Langkah 2: Jalankan di Komputer Sendiri (Localhost)

Untuk menguji aplikasi sambil membangunkan kod:

```bash
npm run dev
```

## 🌐 Langkah 3: Upload ke GitHub & Jadikan Laman Web (Deploy)

Ikut langkah ini untuk menjadikan aplikasi ini "Live" supaya boleh diakses oleh guru lain melalui link (contoh: `https://username.github.io/rak-skeme`).

### A. Setup GitHub Repo (Buat sekali sahaja)
1. Pergi ke laman web GitHub dan buat **New Repository**.
2. Namakan sebagai `rak-skeme`.
3. Di Terminal VS Code, jalankan arahan ini satu per satu:

```bash
git init
git add .
git commit -m "Upload pertama RAK SKeMe"
git branch -M main
# Gantikan USERNAME dengan username GitHub anda
git remote add origin https://github.com/USERNAME/rak-skeme.git
git push -u origin main
```

### B. Lancarkan Laman Web (Deploy to GitHub Pages)
Selepas kod berjaya di-upload, jalankan arahan ini untuk membina laman web:

```bash
npm run deploy
```

*Tunggu sehingga proses selesai (keluar perkataan `Published`).*

### C. Tetapan Terakhir di GitHub
1. Pergi ke Repository anda di GitHub.
2. Klik **Settings** > **Pages** (menu kiri).
3. Pastikan **Source** dipilih kepada `gh-pages` branch.
4. Refresh page selepas 1-2 minit, link website anda akan muncul di bahagian atas (biasanya `https://username.github.io/rak-skeme/`).

---

## 🔑 Langkah 4: Setup Database (GitHub Sync)

Aplikasi ini tidak menggunakan database server mahal. Ia menggunakan fail JSON di GitHub anda sebagai database percuma.

1. Buka aplikasi yang telah live tadi.
2. Login sebagai Admin.
3. Pergi ke **Admin Panel** > **GitHub Sync**.
4. Klik **Bantuan Setup** dan ikut arahan untuk buat Token.
   - **PENTING:** Pastikan token anda ada permission **"Read and Write"** untuk **Contents**.

### Struktur Token
- **Owner:** Username GitHub anda (contoh: `aniqnajmuddin`)
- **Repo:** Nama repo database (boleh guna repo sama `rak-skeme` atau buat repo baru khas untuk data contohnya `rak-skeme-data`).
- **Token:** Token yang bermula dengan `ghp_` atau `github_pat_`.

Selamat Maju Jaya!
