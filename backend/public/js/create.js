const msg = document.getElementById('msg');
const createBtn = document.getElementById('createBtn');
const emailInput = document.getElementById('email');

function showMessage(text) {
  msg.textContent = text;
}

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

const user = getUser();
const token = getToken();
if (!user) {
  showMessage('Please login first to create a CV');
} else {
  emailInput.value = user.email;
}

if (createBtn) {
  createBtn.addEventListener('click', () => {
    if (!user || !token) {
      showMessage('Please login first to create a CV');
      return;
    }

    const name = document.getElementById('name').value.trim();
    const keyprogramming = document.getElementById('keyprogramming').value.trim();
    const education = document.getElementById('education').value.trim();
    const profile = document.getElementById('profile').value.trim();
    const URLlinks = document.getElementById('URLlinks').value.trim();

    if (!name || !keyprogramming || !education || !profile || !URLlinks) {
      showMessage('Please fill required fields');
      return;
    }

    showMessage('Creating CV...');

    fetch('/api/cvs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ name, keyprogramming, education, profile, URLlinks })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === 'CV saved' || data.email) {
          showMessage('CV saved. Redirecting to home...');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 800);
          return;
        }
        showMessage(data.message || 'Create failed');
      })
      .catch((err) => {
        console.log(err);
        showMessage('Create error');
      });
  });
}
