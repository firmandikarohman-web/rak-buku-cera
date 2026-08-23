# 🚀 Panduan Deployment, Database & Sinkronisasi — Rak Buku Cera

---

## Daftar Isi
1. [Langkah-Langkah Posting Web ke Server](#1-langkah-langkah-posting-web-ke-server)
2. [Menghubungkan MongoDB ke Store](#2-menghubungkan-mongodb-ke-store)
3. [Sinkronisasi yang Dibutuhkan](#3-sinkronisasi-yang-dibutuhkan)

---

## 1. Langkah-Langkah Posting Web ke Server

### Arsitektur Project Kamu Saat Ini

```mermaid
graph LR
    subgraph "Main Site (Static)"
        A[index.html] --> B[script.js]
        A --> C[style.css]
        B --> D[data/data.json]
    end

    subgraph "Store (Node.js + Express)"
        E[server.js] --> F[MongoDB]
        E --> G[views/index.html]
        E --> H[views/detail.html]
        E --> I[views/cart.html]
        E --> J[public/js/script.js]
    end
```

> [!IMPORTANT]
> Project kamu terdiri dari **2 bagian yang berbeda** dan perlu strategi deployment yang berbeda pula:
> - **Main Site** → Website statis (HTML/CSS/JS + `data.json`)
> - **Store** → Aplikasi Node.js + Express + MongoDB (perlu server backend)

### Opsi Deployment

| Platform | Main Site (Statis) | Store (Node.js) | MongoDB | Gratis? |
|---|---|---|---|---|
| **Vercel** | ✅ Sangat mudah | ✅ Serverless Functions | ❌ Perlu Atlas | ✅ Free tier |
| **Render** | ✅ Static site | ✅ Web Service | ❌ Perlu Atlas | ✅ Free tier |
| **Railway** | ✅ | ✅ | ✅ Built-in MongoDB | ✅ Free trial |
| **VPS (DigitalOcean/Contabo)** | ✅ | ✅ | ✅ Self-hosted | 💰 Mulai ~$5/bulan |
| **Netlify + Render** | ✅ Netlify (statis) | ✅ Render (backend) | ❌ Perlu Atlas | ✅ Free tier |

### Rekomendasi: **Render (Store) + MongoDB Atlas (Database)**

Ini adalah kombinasi paling mudah dan gratis untuk pemula.

---

### Step-by-Step Deployment

#### STEP 1: Persiapan Kode

```
Checklist sebelum deploy:
☐ Pastikan .gitignore sudah benar (node_modules, .env tidak ikut ke-push)
☐ Buat repository di GitHub
☐ Push semua kode ke GitHub
☐ Pastikan tidak ada path lokal yang hardcoded (misalnya C:\Users\...)
```

Pastikan file [.gitignore](file:///c:/Users/Dell/Documents/Project/rak-buku-cera-main-12agus2026/rak-buku-cera-main/store/.gitignore) sudah berisi:

```
node_modules
.env
```

#### STEP 2: Push ke GitHub

```bash
# Dari folder project utama (rak-buku-cera-main)
git init
git add .
git commit -m "Initial commit - Rak Buku Cera"
git remote add origin https://github.com/USERNAME/rak-buku-cera.git
git push -u origin main
```

#### STEP 3: Setup MongoDB Atlas (Database Cloud)

> Detail lengkap ada di [Bagian 2](#2-menghubungkan-mongodb-ke-store)

#### STEP 4A: Deploy Main Site (Statis) ke Netlify/Vercel

**Opsi: Netlify**
1. Buka [netlify.com](https://netlify.com) → Sign up dengan GitHub
2. Klik **"Add new site"** → **"Import from Git"**
3. Pilih repository `rak-buku-cera`
4. Settings:
   - **Base directory**: *(kosong, atau root project)*
   - **Build command**: *(kosong — tidak perlu build)*
   - **Publish directory**: `.` atau folder root
5. Klik **Deploy**

> [!NOTE]
> Main site kamu **100% statis** (HTML + CSS + JS yang baca `data.json`), jadi tidak perlu build process apapun.

#### STEP 4B: Deploy Store (Backend) ke Render

1. Buka [render.com](https://render.com) → Sign up dengan GitHub
2. Klik **"New +"** → **"Web Service"**
3. Connect repository GitHub kamu
4. Settings:
   - **Name**: `rak-buku-cera-store`
   - **Root Directory**: `store`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Tambahkan **Environment Variables**:

   | Key | Value |
   |---|---|
   | `PORT` | `3000` |
   | `DB_URI` | `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/rak_buku_cera_store` |

6. Klik **Deploy**

#### STEP 5: Verifikasi

```
Checklist setelah deploy:
☐ Main site bisa diakses di URL Netlify/Vercel
☐ Store bisa diakses di URL Render
☐ API endpoint /api/books mengembalikan data dari MongoDB
☐ Halaman store menampilkan buku-buku dari database
☐ Cart berfungsi normal
```

---

## 2. Menghubungkan MongoDB ke Store

### Kondisi Saat Ini

Berdasarkan kode kamu:

| File | Status |
|---|---|
| [database.js](file:///c:/Users/Dell/Documents/Project/rak-buku-cera-main-12agus2026/rak-buku-cera-main/store/src/config/database.js) | ✅ Sudah ada konfigurasi Mongoose |
| [Book.js](file:///c:/Users/Dell/Documents/Project/rak-buku-cera-main-12agus2026/rak-buku-cera-main/store/src/models/Book.js) | ✅ Schema sudah dibuat |
| [bookController.js](file:///c:/Users/Dell/Documents/Project/rak-buku-cera-main-12agus2026/rak-buku-cera-main/store/src/controllers/bookController.js) | ✅ CRUD operations |
| [.env](file:///c:/Users/Dell/Documents/Project/rak-buku-cera-main-12agus2026/rak-buku-cera-main/store/.env) | ⚠️ Masih `localhost:27017` |
| Data di MongoDB | ❌ **Kosong! Belum ada data buku** |

> [!WARNING]
> Kode backend kamu sudah siap, tapi **database masih kosong**. Store tidak akan menampilkan buku apa-apa sampai kamu mengisi data ke MongoDB.

### Langkah Menghubungkan MongoDB

#### A. Untuk Lokal (Development)

**Prasyarat:** MongoDB harus terinstall di komputer kamu.

1. **Install MongoDB Community Server** dari [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. **Jalankan MongoDB** — Biasanya otomatis berjalan sebagai service di Windows
3. **Verifikasi** `.env` sudah benar:

```env
PORT=3000
DB_URI=mongodb://localhost:27017/rak_buku_cera_store
```

4. **Jalankan server:**
```bash
cd store
npm start
```

5. Jika berhasil, terminal akan menampilkan:
```
MongoDB Connected: localhost
Server running on http://localhost:3000
```

#### B. Untuk Production (MongoDB Atlas — Cloud)

1. **Buka** [cloud.mongodb.com](https://cloud.mongodb.com) → Buat akun gratis
2. **Buat Cluster** baru (pilih **Free Tier / M0 Sandbox**)
   - Region: pilih yang terdekat (Singapore atau Hongkong)
3. **Buat Database User:**
   - Username: `ceraAdmin` (contoh)
   - Password: buat password yang kuat
4. **Network Access:**
   - Klik "Add IP Address" → **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - *(Untuk production sebenarnya sebaiknya dibatasi, tapi untuk awal ini sudah cukup)*
5. **Dapatkan Connection String:**
   - Klik **"Connect"** → **"Connect your application"**
   - Copy connection string, lalu ganti `<password>` dengan password kamu:

```env
DB_URI=mongodb+srv://ceraAdmin:PASSWORD_KAMU@cluster0.xxxxx.mongodb.net/rak_buku_cera_store?retryWrites=true&w=majority
```

6. **Update `.env`** dengan connection string Atlas tersebut

### Mengisi Data Buku ke MongoDB (Seed Script)

> [!IMPORTANT]
> Ini adalah langkah **paling penting** yang belum kamu lakukan. Tanpa ini, store akan kosong.

Buat file `store/seed.js` untuk mengimpor data buku:

```javascript
// store/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./src/models/Book');

dotenv.config();

const books = [
    {
        title: "Laut Bercerita",
        author: "Leila S. Chudori",
        price: 89000,
        description: "Novel tentang kisah keluarga yang kehilangan, sekumpulan sahabat yang merasakan kekosongan, dan tentang cinta yang tak akan luntur.",
        coverImage: "/images/covers/laut-bercerita.jpg",
        stock: 10
    },
    {
        title: "Psychology of Money",
        author: "Morgan Housel",
        price: 78000,
        description: "19 cerita pendek yang mengeksplorasi cara-cara aneh orang berpikir tentang uang.",
        coverImage: "/images/covers/psychology-of-money.jpg",
        stock: 15
    },
    {
        title: "Secrets of Divine Love",
        author: "A. Helwa",
        price: 95000,
        description: "Sebuah Perjalanan Spiritual yang Mendalam tentang Islam.",
        coverImage: "/images/covers/secrets-of-divine-love.jpg",
        stock: 8
    },
    {
        title: "Dompet Ayah Sepatu Ibu",
        author: "J.S. Khairen",
        price: 85000,
        description: "Novel tentang perjuangan hidup, cinta, dan pengorbanan orang tua.",
        coverImage: "/images/covers/dompet-ayah-sepatu-ibu.jpg",
        stock: 12
    },
    // Tambahkan buku lainnya sesuai kebutuhan...
];

async function seedDB() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('MongoDB Connected untuk seeding...');

        // Hapus data lama (opsional)
        await Book.deleteMany({});
        console.log('Data lama dihapus.');

        // Masukkan data baru
        const inserted = await Book.insertMany(books);
        console.log(`${inserted.length} buku berhasil dimasukkan!`);

        // Tampilkan data yang dimasukkan
        inserted.forEach(book => {
            console.log(`  ✓ ${book.title} (${book._id})`);
        });

    } catch (error) {
        console.error('Gagal seeding:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Koneksi MongoDB ditutup.');
    }
}

seedDB();
```

**Jalankan seed script:**
```bash
cd store
node seed.js
```

---

## 3. Sinkronisasi yang Dibutuhkan

### Masalah Sinkronisasi

Project kamu memiliki **2 sumber data yang terpisah**:

```mermaid
graph TD
    subgraph "Main Site"
        A["data/data.json"] --> B["script.js (fetch JSON)"]
        B --> C["index.html\n(Perpustakaan, Blog, Games, Gallery)"]
    end

    subgraph "Store"
        D["MongoDB (Collection: books)"] --> E["bookController.js (API)"]
        E --> F["views/index.html\n(Katalog Toko)"]
    end

    A -.->|"❌ TIDAK TERHUBUNG"| D

    style A fill:#ff9800,color:#000
    style D fill:#4caf50,color:#000
```

> [!CAUTION]
> Saat ini `data.json` dan MongoDB **tidak terhubung sama sekali**. Jika kamu menambah buku baru di `data.json`, buku itu **TIDAK otomatis muncul** di store, dan sebaliknya.

### Jenis Sinkronisasi yang Dibutuhkan

#### Skenario 1: **Sinkronisasi Manual (Paling Sederhana)**

Cocok untuk project kamu saat ini di mana update buku jarang terjadi.

```
Alur kerja:
1. Edit data.json → Push ke GitHub → Main site terupdate
2. Jalankan seed.js → MongoDB terupdate → Store terupdate
```

**Kelebihan:** Mudah, tidak perlu infrastruktur tambahan
**Kekurangan:** Harus update 2 tempat setiap kali ada perubahan

---

#### Skenario 2: **MongoDB sebagai Satu Sumber Kebenaran (Recommended)**

Pindahkan SEMUA data buku ke MongoDB, lalu buat API untuk main site juga.

```mermaid
graph TD
    subgraph "Satu Sumber Data"
        DB["MongoDB Atlas\n(Semua data buku)"]
    end

    subgraph "Store"
        API1["/api/books"] --> DB
        S1["Store Views"] --> API1
    end

    subgraph "Main Site"
        API2["/api/library"] --> DB
        M1["Main Site Views"] --> API2
    end

    style DB fill:#4caf50,color:#000
```

**Cara implementasi:**

1. **Perluas Book Schema** untuk mengakomodasi data `data.json`:

```javascript
// store/src/models/Book.js (diperluas)
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, default: 0 },
    description: String,
    coverImage: String,
    stock: { type: Number, default: 0 },
    // Field tambahan dari data.json:
    sinopsis: String,
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ['Reading', 'Completed', 'Unread'], default: 'Unread' },
    category: { type: String, enum: ['currentlyReading', 'readingList', 'targetList', 'store'] },
    reviews: {
        rohman: { rating: String, comment: String },
        margi: { rating: String, comment: String }
    }
}, { timestamps: true });
```

2. **Buat API endpoint baru** untuk melayani main site
3. **Ubah main site** untuk fetch dari API alih-alih `data.json`

**Kelebihan:** Satu tempat update, konsisten
**Kekurangan:** Main site jadi bergantung pada server backend (tidak lagi statis murni)

---

#### Skenario 3: **Hybrid — data.json Tetap untuk Main Site, Sync Script untuk Store**

Pertahankan `data.json` sebagai master, lalu buat script otomatis untuk sync ke MongoDB.

```javascript
// store/sync-from-json.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./src/models/Book');

dotenv.config();

async function syncFromJSON() {
    const dataPath = path.join(__dirname, '..', 'data', 'data.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Gabungkan semua buku dari berbagai kategori
    const allBooks = [
        ...rawData.readingList.map(b => ({ ...b, category: 'readingList' })),
        ...rawData.targetList.map(b => ({ ...b, category: 'targetList' })),
    ];

    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB Connected...');

    for (const book of allBooks) {
        await Book.findOneAndUpdate(
            { title: book.title },  // Cari berdasarkan judul
            {
                title: book.title,
                author: book.author,
                description: book.sinopsis,
                coverImage: book.cover,
                price: 0,  // Set harga manual nanti
                status: book.status,
                progress: book.progress,
                category: book.category,
            },
            { upsert: true, new: true }  // Buat baru jika belum ada
        );
        console.log(`✓ Synced: ${book.title}`);
    }

    await mongoose.connection.close();
    console.log('Sync selesai!');
}

syncFromJSON();
```

**Jalankan:** `node store/sync-from-json.js`

---

### Rekomendasi untuk Kamu

> [!TIP]
> **Untuk saat ini, gunakan Skenario 1 (Manual)** karena:
> - Project masih dalam tahap development
> - Jumlah buku masih bisa dikelola secara manual
> - Tidak perlu infrastruktur tambahan yang kompleks
>
> **Nanti ketika project berkembang**, migrasi ke Skenario 2 (MongoDB sebagai single source of truth) akan memberikan pengalaman yang lebih baik.

### Ringkasan To-Do List

```
Urutan langkah yang harus kamu lakukan:

1. ☐ Install MongoDB lokal ATAU daftar MongoDB Atlas
2. ☐ Update .env dengan connection string yang benar
3. ☐ Buat file seed.js dan isi data buku
4. ☐ Jalankan seed.js untuk mengisi database
5. ☐ Test store lokal → pastikan /api/books mengembalikan data
6. ☐ Buat repository GitHub
7. ☐ Push semua kode (tanpa node_modules dan .env)
8. ☐ Deploy main site ke Netlify/Vercel (statis)
9. ☐ Deploy store ke Render (Node.js)
10. ☐ Set environment variables di Render
11. ☐ Test semua endpoint di production
```
