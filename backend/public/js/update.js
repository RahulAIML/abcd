(() => {
  const msg = document.getElementById('msg');
  const updateBtn = document.getElementById('updateBtn');

  const API_BASE = 'https://cv-website-backend-r376.onrender.com';

  function showMessage(text) {
    msg.textContent = text;
  }

  function getId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
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

  const id = getId();
  const user = getUser();
  const token = getToken();

  if (!id) {
    showMessage('No ID found');
  } else {
    fetch(`${API_BASE}/api/cvs/` + id)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          showMessage(data.message);
          return;
        }
        document.getElementById('name').value = data.name || '';
        document.getElementById('keyprogramming').value = data.keyprogramming || '';
        document.getElementById('education').value = data.education || '';
        document.getElementById('profile').value = data.profile || '';
        document.getElementById('URLlinks').value = data.URLlinks || '';
      })
      .catch((err) => {
        console.log(err);
        showMessage('Error loading');
      });
  }

  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      console.log('CLICK WORKING');
      if (!user || !token) {
        showMessage('Please login first');
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

      showMessage('Updating...');

      fetch(`${API_BASE}/api/cvs/` + id, {
        method: 'PUT',
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
          console.log('UPDATE RESPONSE:', data);
          if (data.success || data.id) {
            showMessage('Updated successfully!');
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 800);
          } else {
            showMessage(data.message || 'Update failed');
          }
        })
        .catch((err) => {
          console.error(err);
          showMessage('Update error');
        });
    });
  }
})();
