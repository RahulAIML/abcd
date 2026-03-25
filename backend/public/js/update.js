(() => {
  const msg = document.getElementById('msg');
  const updateBtn = document.getElementById('updateBtn');

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

  const userData = getUser();
  const authToken = getToken();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!userData || !authToken) {
    showMessage('Please login first');
    return;
  }

  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      console.log('UPDATE CLICK WORKING');

      const name = document.getElementById('name').value.trim();
      const keyprogramming = document.getElementById('keyprogramming').value.trim();
      const education = document.getElementById('education').value.trim();
      const profile = document.getElementById('profile').value.trim();
      const URLlinks = document.getElementById('URLlinks').value.trim();

      if (!name || !keyprogramming || !education || !profile || !URLlinks) {
        showMessage('Please fill required fields');
        return;
      }

      fetch(`${API_BASE}/api/cvs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + authToken
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

          if (data.success) {
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
