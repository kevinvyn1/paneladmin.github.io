(function(){
  let app, auth, user;

  const qs = s => document.querySelector(s);
  const byId = id => document.getElementById(id);

  async function ensureAuth(){
    app = firebase.initializeApp(CONFIG.firebase);
    auth = firebase.auth();

    return new Promise((resolve) => {
      auth.onAuthStateChanged(async (u) => {
        // enforce 24h cap jika remember
        const loginAtStr = localStorage.getItem('loginAtMs');
        if(loginAtStr){
          const maxAge = (CONFIG.rememberDurationHours || 24) * 60 * 60 * 1000;
          const expired = (Date.now() - Number(loginAtStr)) > maxAge;
          if(expired){
            await auth.signOut();
            localStorage.removeItem('loginAtMs');
            window.location.href = 'index.html?expired=1';
            return;
          }
        }

        if(!u){
          window.location.href = 'index.html';
          return;
        }
        user = u;
        resolve(u);
      });
    });
  }

  function setupUI(){
    byId('whoami').textContent = user.email || '(tanpa email)';
    byId('logoutBtn').addEventListener('click', async () => {
      await auth.signOut();
      localStorage.removeItem('loginAtMs');
      window.location.href = 'index.html';
    });

    // Nav
    document.querySelectorAll('.menu').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('active'));
        a.classList.add('active');
        const section = a.dataset.section;
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('section-' + section).classList.add('active');
      });
    });

    // Form add
    byId('addForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const addMsg = byId('addMsg'); addMsg.textContent = 'Mengirim...';
      try{
        const payload = {
          userid: byId('f_userid').value.trim(),
          no_random: byId('f_no').value.trim(),
          aktif: byId('f_aktif').value.trim(),
          nama: byId('f_nama').value.trim()
        };
        if(!payload.userid || !payload.no_random || !payload.aktif || !payload.nama){
          addMsg.textContent = 'Semua field wajib diisi.'; return;
        }
        if(!/^[01]$/.test(payload.aktif)){
          addMsg.textContent = 'Field aktif harus 0 atau 1.'; return;
        }

        await callApi('POST', payload);
        addMsg.textContent = 'Berhasil ditambahkan.';
        byId('addForm').reset();
        await loadWhitelist(); // refresh
      }catch(err){
        console.error(err);
        addMsg.textContent = 'Gagal menambahkan: ' + (err?.message || 'Unknown error');
      }
    });
  }

  async function callApi(method = 'GET', body = null){
    const url = CONFIG.appsScriptUrl;
    const headers = { 'Content-Type': 'application/json', 'X-API-KEY': CONFIG.appsScriptSecret };
    if(CONFIG.requireFirebaseOnApi){
      const idToken = await user.getIdToken(/* forceRefresh */ true);
      headers['Authorization'] = 'Bearer ' + idToken;
    }

    const init = { method, headers, mode: 'cors' };
    if(body) init.body = JSON.stringify(body);

    const resp = await fetch(url + (method === 'GET' ? '?action=list' : ''), init);
    if(!resp.ok){
      const txt = await resp.text();
      throw new Error('API error ' + resp.status + ': ' + txt);
    }
    return await resp.json();
  }

  async function loadWhitelist(){
    const tbody = byId('whitelistTable').querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="6">Memuat data...</td></tr>';
    try{
      const data = await callApi('GET');
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      if(rows.length === 0){
        tbody.innerHTML = '<tr><td colspan="6">Kosong.</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map((r, i) => {
        const [userid, no_random, aktif, nama, timestamp] = r;
        return `<tr>
          <td>${i+1}</td>
          <td>${escapeHtml(userid)}</td>
          <td>${escapeHtml(no_random)}</td>
          <td>${escapeHtml(aktif)}</td>
          <td>${escapeHtml(nama)}</td>
          <td>${escapeHtml(timestamp||'')}</td>
        </tr>`;
      }).join('');
    }catch(err){
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="6">Gagal memuat: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, (m) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await ensureAuth();
    setupUI();
    await loadWhitelist();
  });
})();