const msg = document.getElementById('msg');
const registerBtn = document.getElementById('registerBtn');

function showMessage(text) {
  msg.textContent = text;
}

registerBtn.addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !email || !password) {
    showMessage('Please fill all fields');
    return;
  }

  showMessage('Registering...');

  fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.user) {
        showMessage('Registration completed. Go to login.');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 800);
        return;
      }
      showMessage(data.message || 'Register failed');
    })
    .catch((err) => {
      console.log(err);
      showMessage('Register error');
    });
});
