(function(){
  let app;
  let auth;

  const init = () => {
    app = firebase.initializeApp(CONFIG.firebase);
    auth = firebase.auth();

    const form = document.getElementById('loginForm');
    const msg = document.getElementById('loginMsg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';

      const username = (document.getElementById('username').value || '').trim();
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;

      if(!username || !password){
        msg.textContent = 'Username dan password wajib diisi.';
        return;
      }

      // mapping username -> email (jika user memasukkan username saja)
      const email = username.includes('@')
        ? username
        : `${username}@${CONFIG.usernameEmailDomain}`;

      try {
        // persistence: session (tanpa ingat), local (ingat) + enforce 24 jam
        if(remember){
          await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        }else{
          await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }

        await auth.signInWithEmailAndPassword(email, password);

        // simpan timestamp login jika remember
        if(remember){
          localStorage.setItem('loginAtMs', String(Date.now()));
        }else{
          localStorage.removeItem('loginAtMs');
        }

        // redirect ke dashboard
        window.location.href = 'dashboard.html';
      } catch(err){
        console.error(err);
        msg.textContent = 'Gagal masuk: ' + (err?.message || 'Unknown error');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', init);
})();