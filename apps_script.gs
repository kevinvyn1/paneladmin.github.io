/**
 * Google Apps Script — API untuk Whitelist (Google Sheets)
 * Keamanan: X-API-KEY (shared secret) + (opsional) verifikasi Firebase ID Token.
 */

// === EDIT BAGIAN INI ===
const SHEET_ID = "https://docs.google.com/spreadsheets/d/1vwbvVeudl_0KZOFU4PfSlYwN5BIcqgnxF1Vj_CPJaGc/edit?gid=0#gid=0";
const SHEET_NAME = "Whitelist";    // atau nama tab Anda
const API_KEY_SHARED = "GANTI_DENGAN_RANDOM_LONG_SECRET"; // sama dengan CONFIG.appsScriptSecret
const REQUIRE_FIREBASE = true;      // sinkronkan dengan CONFIG.requireFirebaseOnApi
const FIREBASE_WEB_API_KEY = "AIzaSyAkwBGy6SYao2pIEHJTLyl4OtjW0c-AJ6o"; // untuk verifikasi ID token via REST
// === AKHIR EDIT ===

// CORS
const ALLOW_ORIGIN = "*";

function doOptions(e){
  return _cors(new ContentService.createTextOutput(""), 204);
}

function doGet(e){
  try {
    _checkSecret(e);
    if(REQUIRE_FIREBASE){ _checkFirebase(e); }

    const action = (e.parameter && e.parameter.action) || "list";
    if(action !== "list"){
      return _json({ error: "unknown_action" }, 400);
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues(); // [[header...], [row1...], ...]

    // buang header jika ada, dan normalisasi panjang 5 kolom
    let rows = values;
    if(values && values.length > 0){
      // deteksi header sederhana: jika kolom pertama adalah string "userid"
      const first = String(values[0][0] || "").toLowerCase();
      if(first === "userid"){
        rows = values.slice(1);
      }
    }
    rows = rows.map(r => [r[0]||"", r[1]||"", r[2]||"", r[3]||"", r[4]||""]);
    return _json({ rows });
  } catch(err){
    return _json({ error: String(err) }, 401);
  }
}

function doPost(e){
  try {
    _checkSecret(e);
    if(REQUIRE_FIREBASE){ _checkFirebase(e); }

    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const { userid, no_random, aktif, nama } = body || {};
    if(!userid || !no_random || (aktif !== "0" && aktif !== "1") || !nama){
      return _json({ error: "invalid_payload" }, 400);
    }

    const ts = new Date();
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([userid, no_random, aktif, nama, ts]);

    return _json({ ok: true, ts: ts.toISOString() });
  } catch(err){
    return _json({ error: String(err) }, 401);
  }
}

// ===== Helpers =====

function _checkSecret(e){
  const headers = e?.headers || {};
  const apiKey = headers["x-api-key"] || headers["X-API-KEY"];
  if(apiKey !== API_KEY_SHARED){
    throw "unauthorized_secret";
  }
}

function _checkFirebase(e){
  // Ambil bearer token dari header Authorization
  const headers = e?.headers || {};
  const authz = headers["authorization"] || headers["Authorization"] || "";
  const m = authz.match(/^Bearer\s+(.+)$/i);
  if(!m){ throw "missing_bearer"; }
  const idToken = m[1];

  // Verifikasi token via Identity Toolkit REST
  const url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(FIREBASE_WEB_API_KEY);
  const payload = JSON.stringify({ idToken });
  const resp = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    payload
  });
  const code = resp.getResponseCode();
  if(code !== 200){
    throw "invalid_id_token(" + code + "): " + resp.getContentText();
  }
  // optional: tambahan pengecekan email/uid tertentu (role admin)
  // const data = JSON.parse(resp.getContentText());
  // const email = data?.users?.[0]?.email || "";
  // if(email !== "adminis@example.local"){ throw "not_admin"; }
}

function _json(obj, status){
  const out = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return _cors(out, status || 200);
}

function _cors(out, status){
  const resp = HtmlService.createHtmlOutput(out.getContent())
    .setTitle("api");
  // Workaround: ContentService tidak bisa set status code & headers lengkap.
  // Alternatif: gunakan doGet/doPost biasa + JSON, dan andalkan fetch() menangani CORS.
  // Di sini kita manual set header pada TextOutput lewat setHeaders tidak tersedia,
  // namun Apps Script Web App biasanya sudah menyertakan CORS bila "Anyone" diizinkan.
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
