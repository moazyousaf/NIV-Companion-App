// ===== Get modal elements and buttons =====
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');

const loginBtn = document.getElementById('login');
const registerBtn = document.getElementById('registrati');

const closeLoginModalBtn = document.getElementById('close-login-modal');
const closeRegisterModalBtn = document.getElementById('close-register-modal');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// ===== Open modals =====
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.classList.add('active');
});

registerBtn.addEventListener('click', (e) => {
  e.preventDefault();
  registerModal.classList.add('active');
});

// ===== Close modals =====
closeLoginModalBtn.addEventListener('click', () =>
  loginModal.classList.remove('active')
);
closeRegisterModalBtn.addEventListener('click', () =>
  registerModal.classList.remove('active')
);

// Close if clicked outside the content
loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) loginModal.classList.remove('active');
});

registerModal.addEventListener('click', (e) => {
  if (e.target === registerModal) registerModal.classList.remove('active');
});

// ===== Registration form =====
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';

  const name = registerForm.name.value.trim();
  const email = registerForm.email.value.trim();
  const password = registerForm.pass.value;
  const confirm = registerForm.confirm.value;
  const role = registerForm.role.value;

  if (password !== confirm) {
    registerError.textContent = 'Passwords do not match';
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    alert('✅ Registration successful!');
    registerModal.classList.remove('active');
    registerForm.reset();
  } catch (err) {
    registerError.textContent = err.message;
  }
});

// ===== Login form =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = loginForm.email.value.trim();
  const password = loginForm.pass.value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.user.role);
    localStorage.setItem('name', data.user.name);
    localStorage.setItem('id', data.user.id);

    alert('✅ Login successful!');
    loginModal.classList.remove('active');
    loginForm.reset();
    window.location.href = 'dashboard.html';
  } catch (err) {
    loginError.textContent = err.message;
  }
});
