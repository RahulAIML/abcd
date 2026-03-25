const msg = document.getElementById('msg');
const loginBtn = document.getElementById('loginBtn');
const API_BASE = window.API_BASE || window.location.origin;

function showMessage(text) {
  msg.textContent = text;
}

loginBtn.addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showMessage('Please fill all fields');
    return;
  }

  showMessage('Logging in...');

  fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        showMessage('Login completed. Redirecting to home...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
        return;
      }
      showMessage(data.message || 'Login failed');
    })
    .catch((err) => {
      console.log(err);
      showMessage('Login error');
    });
});
