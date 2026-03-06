
function $(id) {
  return document.getElementById(id);
}

function setHidden(el, hidden) {
  if (!el) return;
  el.classList.toggle('hidden', !!hidden);
}

function dispatch(name) {
  document.dispatchEvent(new Event(name));
}

async function fetchMe() {
  try {
    const res = await fetch('api/me.php', { credentials: 'include' });
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

function renderUserBox(userBox, logoutBtn, user) {
  if (userBox) {
    if (!user) {
      userBox.textContent = '';
      setHidden(userBox, true);
    } else {
      const uClass = user.class != null ? user.class : '';
      if (user.role === 'teacher') {
        userBox.innerHTML = `<span class="teacher">📚 Teacher<br>${user.username}${uClass !== '' ? ` (class ${uClass})` : ''}</span>`;
      } else {
        userBox.textContent = `👨‍🚀 ${user.username}${uClass !== '' ? ` (class ${uClass})` : ''}`;
      }
      setHidden(userBox, false);
    }
  }

  if (logoutBtn) {
    setHidden(logoutBtn, !user);
  }
}

export function initAuth() {
  const authModal = $('auth-modal');
  const loginSection = $('login-section');
  const registerSection = $('register-section');

  const userBox = $('user-box');
  const logoutBtn = $('logout-btn');

  if (!authModal) return;

  const setAuthModalVisible = isVisible => {
    setHidden(authModal, !isVisible);
  };

  const showLogin = () => {
    setHidden(loginSection, false);
    setHidden(registerSection, true);
  };

  const showRegister = () => {
    setHidden(loginSection, true);
    setHidden(registerSection, false);
  };

  const updateLocalClass = user => {
    if (!user || user.class == null) localStorage.removeItem('class');
    else localStorage.setItem('class', user.class);
  };

  const refreshSessionUI = async () => {
    const user = await fetchMe();
    window.__currentUser = user;

    if (user) {
      setAuthModalVisible(false);
      renderUserBox(userBox, logoutBtn, user);
      updateLocalClass(user);
      dispatch('userLoggedIn');
    } else {
      renderUserBox(userBox, logoutBtn, null);
      setAuthModalVisible(true);
      showLogin();
    }
  };

  const showRegisterLink = $('show-register-link');
  const showLoginLink = $('show-login-link');
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', e => {
      e.preventDefault();
      showRegister();
    });
  }
  if (showLoginLink) {
    showLoginLink.addEventListener('click', e => {
      e.preventDefault();
      showLogin();
    });
  }

  const loginForm = $('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();

      const username = $('login-username')?.value.trim();
      const password = $('login-password')?.value;
      const role = $('login-role')?.value;

      if (!username || !password || !role) {
        alert('Please заполните все поля.');
        return;
      }

      try {
        const res = await fetch('api/login.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role })
        });

        const data = await res.json();
        if (!data.success) {
          alert(data.error || 'Login failed');
          return;
        }

        const user = data.user || null;
        window.__currentUser = user;
        setAuthModalVisible(false);
        renderUserBox(userBox, logoutBtn, user);
        updateLocalClass(user);
        dispatch('userLoggedIn');
      } catch (err) {
        console.error('Login error:', err);
        alert('Login error. Check console.');
      }
    });
  }

  const registerForm = $('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();

      const username = $('register-username')?.value.trim();
      const password = $('register-password')?.value;
      const role = $('register-role')?.value;
      const userClass = Number($('register-class')?.value);

      if (!username || !password || !role || !Number.isFinite(userClass)) {
        alert('Please заполните все поля.');
        return;
      }
      if (userClass < 1 || userClass > 11) {
        alert('Class must be between 1 and 11');
        return;
      }

      try {
        const res = await fetch('api/register.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role, class: userClass })
        });

        const data = await res.json();
        if (!data.success) {
          alert(data.error || 'Registration failed');
          return;
        }

        const user = data.user || null;
        window.__currentUser = user;
        setAuthModalVisible(false);
        renderUserBox(userBox, logoutBtn, user);
        updateLocalClass(user);
        dispatch('userLoggedIn');
      } catch (err) {
        console.error('Register error:', err);
        alert('Registration error. Check console.');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('api/logout.php', { credentials: 'include' });
        const data = await res.json();

        if (data.success) {
          localStorage.removeItem('class');
          window.__currentUser = null;
          renderUserBox(userBox, logoutBtn, null);
          setAuthModalVisible(true);
          showLogin();
          dispatch('userLoggedOut');
        }
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  }

  refreshSessionUI();
}
