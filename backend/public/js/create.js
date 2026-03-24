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

const user = getUser();
if (!user) {
  showMessage('Please login first to create a CV');
} else {
  emailInput.value = user.email;
}

createBtn.addEventListener('click', () => {
  if (!user) {
    showMessage('Please login first to create a CV');
    return;
  }

  const name = document.getElementById('name').value.trim();
  const email = user.email;
  const keyprogramming = document.getElementById('keyprogramming').value.trim();
  const education = document.getElementById('education').value.trim();
  const profile = document.getElementById('profile').value.trim();
  const URLlinks = document.getElementById('URLlinks').value.trim();

  if (!name || !email || !keyprogramming) {
    showMessage('Please fill required fields');
    return;
  }

  showMessage('Creating CV...');

  fetch('/api/cvs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      keyprogramming,
      education,
      profile,
      URLlinks
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.id) {
        showMessage('CV created. Opening details...');
        setTimeout(() => {
          window.location.href = 'cv.html?id=' + data.id;
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
