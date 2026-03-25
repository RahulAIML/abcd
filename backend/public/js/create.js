(() => {
  const msg = document.getElementById('msg');
  const createBtn = document.getElementById('createBtn');
  const emailInput = document.getElementById('email');

  const API_BASE = 'https://cv-website-backend-r376.onrender.com';

  function showMessage(text) {
    msg.textContent = text;
  }

  function getUser() {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
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
      console.log('CLICK WORKING');

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

      fetch(`${API_BASE}/api/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          name,
          keyprogramming,
          education,
          profile,
          URLlinks
        })
      })
        .then((res) => {
          console.log('STATUS:', res.status);
          return res.json();
        })
        .then((data) => {
          console.log('CREATE RESPONSE:', data);

          if (data.success) {
            showMessage('CV created successfully!');
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 800);
          } else {
            showMessage(data.message || 'Create failed');
          }
        })
        .catch((err) => {
          console.error(err);
          showMessage('Create error');
        });
    });
  }
})();
