# Admin Panel (GitHub Pages) — Firebase Auth + Google Sheets (Apps Script API)

Panel admin statis yang bisa di-host di GitHub Pages (tanpa biaya) dengan:
- **Login** menggunakan Firebase Authentication (email+password di-backend Firebase; pengguna tidak bisa daftar sendiri).
- **"Ingat login"**: bila dicentang, sesi berlaku **maksimum 24 jam** lalu otomatis logout; bila tidak dicentang, sesi hanya berlaku selama tab aktif (ditutup = keluar).
- **Dashboard** berisi:
  - Tabel **Whitelist** yang dimuat dari Google Sheet.
  - **Form tambah** baris whitelist ke Google Sheet, format: `<userid> <no_random> <1/0> <nama>`.
- **Keamanan**:
  - Password **tidak** disimpan di repo; dikelola aman oleh Firebase (free tier).
  - Akses API Apps Script dilindungi **X-API-KEY** rahasia + (opsional) verifikasi **Firebase ID Token**.
  - CORS & preflight ditangani di Apps Script.

## Cara Pasang (ringkas)
1) **Firebase Authentication**
   - Buat project di https://console.firebase.google.com
   - Aktifkan **Authentication > Sign-in method > Email/Password**.
   - **Add user** secara manual untuk setiap admin (contoh: `adminis@example.local`).
   - Catat **apiKey, authDomain, projectId, appId** dari **Project settings**.

2) **Google Sheet**
   - Buat Sheet baru. Ganti nama tab menjadi `Whitelist` (atau sesuaikan di Apps Script).
   - Baris header (opsional): `userid | no_random | aktif(1/0) | nama | timestamp`.

3) **Apps Script (sebagai API)**
   - Di Sheet: Extensions > Apps Script. Buat script dari `apps_script.gs` (file ada di repo ini).
   - Ubah konstanta: `SHEET_ID`, `SHEET_NAME`, `API_KEY_SHARED`, `FIREBASE_WEB_API_KEY` (opsional).
   - Deploy: **Deploy > New deployment > type: Web app**.
     - **Execute as**: *Me*
     - **Who has access**: *Anyone*
   - Simpan **Web app URL**, masukkan ke `assets/config.js`.

4) **Konfigurasi Frontend**
   - Edit `assets/config.js`: isi `firebase`, `appsScriptUrl`, `appsScriptSecret`, dll.

5) **Hosting di GitHub Pages**
   - Push semua file ke repo publik `username.github.io` atau aktifkan Pages di `Settings > Pages`.
   - Akses `https://username.github.io/` untuk halaman login.

## Catatan
- Form login menerima **username**; sistem otomatis mapping ke email `username@EXAMPLE.LOCAL` (ubah domain di `config.js`).
- Anda bisa juga langsung ketik email penuh saat login.
