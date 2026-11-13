# Nutriste

Nutriste adalah backend REST API untuk membantu pengguna mengelola profil kesehatan, target nutrisi, rencana makan, resep, pelacakan kalori, dan konsultasi gizi berbasis AI.

## Fitur

- Registrasi, login, verifikasi OTP, reset password, dan login dengan Google.
- Profil kesehatan pengguna beserta foto profil.
- Saran nutrisi dan meal plan yang dibuat dengan Google Gemini.
- Resep makanan dan gambar makanan.
- Target nutrisi dan riwayat kalori.
- Chatbot khusus topik makanan sehat dan rencana makan.
- Penyimpanan data menggunakan MongoDB.

## Teknologi

- Node.js dan Express 5
- MongoDB dengan Mongoose
- JWT dan bcrypt
- Google OAuth 2.0
- Nodemailer untuk OTP email
- Google Gemini API
- Vercel untuk deployment

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- MongoDB
- Akun Google Cloud jika menggunakan login Google atau pencarian gambar
- API key Google Gemini
- Akun Gmail atau SMTP yang dapat digunakan untuk mengirim OTP

## Instalasi

```bash
git clone https://github.com/sewysei/Nutriste.git
cd Nutriste
npm install
```

Buat file `.env` di root project:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/nutriste
JWT_SECRET=ganti-dengan-secret-yang-kuat

AUTH_EMAIL=alamat-pengirim@gmail.com
AUTH_PASS=app-password-gmail

GEMINI_API_KEY=your-gemini-api-key

GOOGLE_CLIENT_ID2=your-google-client-id
GOOGLE_CLIENT_SECRET2=your-google-client-secret
GOOGLE_SEARCH_API_ID=your-programmable-search-engine-id
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
```

Jangan commit file `.env` atau membagikan nilai secret dan API key.

## Menjalankan server

```bash
node index.js
```

Server berjalan pada:

```text
http://localhost:8080
```

Endpoint health check:

```http
GET /
```

## Autentikasi

Endpoint yang membutuhkan autentikasi menggunakan JWT dari endpoint login. Kirim token pada header berikut:

```http
Authorization: Bearer <token>
```

Token berlaku selama 7 hari. CORS saat ini mengizinkan `http://localhost:3000` dan `https://nutriste-black.vercel.app`.

## API

### Auth

| Method | Endpoint | Auth | Keterangan |
|---|---|---:|---|
| `POST` | `/auth/register` | Tidak | Mendaftarkan pengguna dan mengirim OTP |
| `POST` | `/auth/login` | Tidak | Login dengan email atau username |
| `GET` | `/auth/google` | Tidak | Memulai Google OAuth |
| `GET` | `/auth/google/callback` | Tidak | Callback Google OAuth |
| `POST` | `/auth/password` | Ya | Menambahkan password untuk akun Google |
| `GET` | `/auth/verify-email` | Tidak | Verifikasi OTP |
| `POST` | `/auth/verifyOTP` | Tidak | Verifikasi OTP |
| `POST` | `/auth/resend-otp` | Tidak | Mengirim ulang OTP |
| `POST` | `/auth/forgot-password` | Tidak | Meminta OTP reset password |
| `POST` | `/auth/reset-password` | Tidak | Mengganti password |
| `GET` | `/auth/logout` | Ya | Logout |
| `POST` | `/auth/delete` | Tidak | Menghapus akun berdasarkan email |

### Profil dan nutrisi

| Method | Endpoint | Auth | Keterangan |
|---|---|---:|---|
| `POST` | `/profile` | Ya | Membuat atau memperbarui profil kesehatan |
| `GET` | `/profile` | Ya | Mengambil profil kesehatan |
| `GET` | `/nutrition` | Ya | Mengambil atau membuat saran nutrisi |
| `GET` | `/nutrition-today` | Ya | Mengambil nutrisi hari ini |
| `GET` | `/calories?days=7` | Ya | Mengambil riwayat kalori berdasarkan jumlah hari |
| `GET` | `/meal-plan` | Ya | Mengambil atau membuat meal plan |
| `GET` | `/meal-plan-images` | Ya | Menambahkan gambar ke meal plan |
| `POST` | `/target-nutrition` | Ya | Membuat atau memperbarui target nutrisi |
| `GET` | `/nutrition-summary` | Ya | Endpoint ringkasan nutrisi |
| `GET` | `/recipes` | Ya | Mengambil atau membuat resep |
| `POST` | `/specific-recipe?index=0` | Ya | Mengambil resep berdasarkan indeks |
| `GET` | `/fun-fact` | Tidak | Mengambil fakta seputar nutrisi |
| `GET` | `/tips` | Tidak | Mengambil tips kesehatan |
| `GET` | `/uploads/<nama-file>` | Tidak | Mengakses file upload |

Untuk `/profile`, gunakan `multipart/form-data`. Field `photo` hanya menerima JPG, JPEG, atau PNG.

### Chatbot

| Method | Endpoint | Auth | Keterangan |
|---|---|---:|---|
| `POST` | `/chat` | Ya | Mengirim pesan ke chatbot gizi |
| `GET` | `/chat` | Ya | Mengambil riwayat chat |

## Contoh penggunaan

### Registrasi

```bash
curl -X POST http://localhost:8080/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"andi\",\"email\":\"andi@example.com\",\"password\":\"secret123\",\"confirmPassword\":\"secret123\"}"
```

### Login

```bash
curl -X POST http://localhost:8080/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"input\":\"andi@example.com\",\"password\":\"secret123\"}"
```

Simpan nilai `token` dari response login untuk request berikutnya.

### Membuat profil kesehatan

```bash
curl -X POST http://localhost:8080/profile ^
  -H "Authorization: Bearer <token>" ^
  -F "age=25" ^
  -F "name=Andi" ^
  -F "gender=Laki-laki" ^
  -F "height=170" ^
  -F "weight=65" ^
  -F "activity=Kantoran" ^
  -F "healthCondition=Sehat" ^
  -F "foodRestrictions=Tidak ada" ^
  -F "activeStatus=Sedang" ^
  -F "mealsPerDay=3" ^
  -F "favouriteFood=Nasi" ^
  -F "purposes=Menjaga berat badan"
```

### Mengirim pesan ke chatbot

```bash
curl -X POST http://localhost:8080/chat ^
  -H "Authorization: Bearer <token>" ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"Apa contoh sarapan tinggi protein?\"}"
```

## Deployment ke Vercel

Project sudah memiliki konfigurasi pada `vercel.json`. Tambahkan seluruh environment variable pada pengaturan project Vercel, lalu deploy:

```bash
npx vercel
```

Pastikan URL callback Google OAuth sesuai dengan URL yang digunakan deployment:

```text
https://nutriste.vercel.app/auth/google/callback
```

## Struktur project

```text
.
├── handler/
│   ├── AUTH/       # Autentikasi dan manajemen akun
│   ├── CHATBOT/   # Chatbot dan riwayat percakapan
│   └── NUTRITION/ # Profil, nutrisi, meal plan, resep, dan kalori
├── models/        # Schema Mongoose
├── db.js          # Koneksi MongoDB
├── index.js       # Inisialisasi Express dan routing
├── uploadFile.js  # Konfigurasi upload foto
├── verifyToken.js # Utilitas token
├── package.json
└── vercel.json
```

## Testing

Belum ada test otomatis. Script `npm test` saat ini masih berupa placeholder dari `package.json`.

## Lisensi

Project ini menggunakan lisensi ISC.
