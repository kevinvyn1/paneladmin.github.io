// Konfigurasi — EDIT sesuai project Anda
const CONFIG = {
  // Firebase Web Config (PUBLIC, aman ditaruh di frontend)
  firebase: {
    apiKey: "AIzaSyAkwBGy6SYao2pIEHJTLyl4OtjW0c-AJ6o",
    authDomain: "console.firebase.google.com",
    projectId: "1yH0MpwYOpXtQBp-EPIovfpNmzC1td1wqgOUbBzlKXZWJ4PnLd0a1JZNY",
    appId: "AKfycbw0LvlyfTfayAeVIBNw7-LuXacpKtnPZhCyXCeqDwachNpuBskYYWMiZr-hw3EGLWFS"
  },

  // Domain email untuk mapping username -> email. Misal: adminis => adminis@example.local
  usernameEmailDomain: "example.local",

  // URL Web App (Apps Script) yang Anda deploy (lihat README)
  appsScriptUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",

  // Rahasia sederhana untuk membatasi akses ke Apps Script.
  // Simpan sama persis dengan API_KEY_SHARED di apps_script.gs
  appsScriptSecret: "GANTI_DENGAN_RANDOM_LONG_SECRET",

  // Wajibkan Apps Script memverifikasi Firebase ID Token dari user yang login
  // (Anda juga harus mengisi FIREBASE_WEB_API_KEY di apps_script.gs)
  requireFirebaseOnApi: true,

  // Durasi "ingat login" (jam). Setelah lewat, user otomatis di-logout.
  rememberDurationHours: 24
};
