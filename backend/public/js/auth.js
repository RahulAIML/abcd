function getUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

const logoutBtn = document.getElementById('logoutBtn');
const userBox = document.getElementById('userBox');
const user = getUser();

if (userBox) {
  if (user) {
    userBox.textContent = 'Logged in as: ' + user.email;
  } else {
    userBox.textContent = 'Not logged in';
  }
}

if (logoutBtn) {
  if (!user) {
    logoutBtn.style.display = 'none';
  }
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    alert('Logout completed');
    window.location.href = 'login.html';
  });
}
