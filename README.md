# Digital Bookshelf

Website log bacaan kolaboratif yang didesain dengan indah menggunakan estetika "Airy Professional" dan *light glassmorphism*. Platform ini berfungsi sebagai wadah sentral bagi Rohman dan Margi untuk mendokumentasikan perjalanan literasi bersama.

## ✨ Fitur Utama

- **Log Bacaan Kolaboratif**: Dilengkapi dengan sistem ulasan ganda (*dual-review*) yang memungkinkan Rohman dan Margi untuk membagikan perspektif dan penilaian masing-masing pada setiap buku.
- **Arsitektur Konten Dinamis**: Semua data (Buku yang Sedang Dibaca, Daftar Bacaan, Daftar Target) diambil secara dinamis dari satu file `data.json`, membuat pembaruan konten menjadi sangat mudah tanpa perlu menyentuh kode.
- **Pelacakan Progres**: *Progress bar* visual dengan animasi gradasi yang halus untuk menunjukkan persentase buku yang sedang dibaca.
- **UI/UX Modern**:
  - **Desain Light Glassmorphism**: Antarmuka yang minimalis dan bersih menggunakan efek *backdrop-filter* CSS modern.
  - **Pengalaman Interaktif**: Efek *hover* magnetik pada ikon dan animasi muncul (*reveal*) yang mulus saat menggulir layar.
  - **Animasi Fluid**: Bentuk organik yang mengambang dan efek *parallax scroll* untuk pengalaman visual yang memanjakan mata.
- **Responsif Penuh**: Tampilan yang menyesuaikan dengan sempurna untuk perangkat seluler, tablet, maupun layar desktop.

## 🛠️ Teknologi yang Digunakan

- **Inti**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Ikon**: [Feather Icons](https://feathericons.com/)
- **Tipografi**: Inter & Chronicle/Playfair Display (Google Fonts)
- **Manajemen Data**: JSON Fetch API

## 📂 Struktur Proyek

- `index.html`: Struktur utama halaman, navigasi, dan tata letak bagian-bagian utama.
- `style.css`: Desain kustom, efek *glassmorphism*, tata letak grid, dan animasi interaktif.
- `script.js`: Logika Javascript, *intersection observers*, dan kode untuk mengambil (*fetch*) serta merender data.
- `data/data.json`: File terpusat untuk menyimpan dan mengelola semua data buku, ulasan, dan target bacaan Anda.

## 📬 Kontak

- **Instagram Rohman**: [@rohmanfirmandika](https://instagram.com/rohmanfirmandika)
- **Instagram Margi**: [@dwimargias](https://instagram.com/dwimargias)
