const msg = document.getElementById('msg');
const updateBtn = document.getElementById('updateBtn');

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
  } catch (e) {
    return null;
  }
}

const id = getId();
const user = getUser();

if (!id) {
  showMessage('No ID found');
} else {
  fetch('/api/cvs/' + id)
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

updateBtn.addEventListener('click', () => {
  if (!user) {
    showMessage('Please login first');
    return;
  }

  const name = document.getElementById('name').value.trim();
  const keyprogramming = document.getElementById('keyprogramming').value.trim();
  const education = document.getElementById('education').value.trim();
  const profile = document.getElementById('profile').value.trim();
  const URLlinks = document.getElementById('URLlinks').value.trim();

  if (!name && !keyprogramming && !education && !profile && !URLlinks) {
    showMessage('Enter something to update');
    return;
  }

  showMessage('Updating...');

  fetch('/api/cvs/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      keyprogramming,
      education,
      profile,
      URLlinks,
      email: user.email
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message && data.message !== 'Updated') {
        showMessage(data.message);
        return;
      }
      showMessage('Update completed. Opening details...');
      setTimeout(() => {
        window.location.href = 'cv.html?id=' + id;
      }, 800);
    })
    .catch((err) => {
      console.log(err);
      showMessage('Update error');
    });
});
