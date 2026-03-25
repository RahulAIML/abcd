function getUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

const logoutBtn = document.getElementById('logoutBtn');
const userBox = document.getElementById('userBox');
const user = getUser();
const token = getToken();

if (userBox) {
  if (user && token) {
    userBox.textContent = 'Logged in as: ' + user.email;
  } else {
    userBox.textContent = 'Not logged in';
  }
}

if (logoutBtn) {
  if (!user || !token) {
    logoutBtn.style.display = 'none';
  }
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    alert('Logout completed');
    window.location.href = 'login.html';
  });
}
