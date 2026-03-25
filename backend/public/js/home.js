const list = document.getElementById('cvList');
const msg = document.getElementById('msg');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

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

function renderCVs(data) {
  list.innerHTML = '';
  if (!data || data.length === 0) {
    list.innerHTML = '<div class="card">No results found</div>';
    return;
  }

  const user = getUser();

  data.forEach((cv) => {
    const div = document.createElement('div');
    div.className = 'card';

    let updateLink = '';
    if (user && (cv.email === user.email || cv.id === user.id)) {
      updateLink = ` | <a href="update.html?id=${cv.id}">Update</a>`;
    }

    div.innerHTML = `
      <strong>${cv.name || 'No name'}</strong><br>
      <span class="small">${cv.email || ''}</span><br>
      <span class="small">${cv.keyprogramming || ''}</span><br>
      <a href="cv.html?id=${cv.id}">View</a>${updateLink}
    `;
    list.appendChild(div);
  });
}

function loadAll() {
  showMessage('Loading...');
  fetch('/api/cvs')
    .then((res) => res.json())
    .then((data) => {
      renderCVs(data);
      showMessage('');
    })
    .catch((err) => {
      console.log(err);
      showMessage('Error loading CVs');
    });
}

searchBtn.addEventListener('click', () => {
  const name = document.getElementById('searchName').value.trim();
  const keyprogramming = document.getElementById('searchLang').value.trim();

  if (!name && !keyprogramming) {
    showMessage('Enter name or keyprogramming');
    return;
  }

  showMessage('Searching...');
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (keyprogramming) params.append('keyprogramming', keyprogramming);

  fetch('/api/cvs/search?' + params.toString())
    .then((res) => res.json())
    .then((data) => {
      renderCVs(data);
      showMessage('');
    })
    .catch((err) => {
      console.log(err);
      showMessage('Error searching');
    });
});

clearBtn.addEventListener('click', () => {
  document.getElementById('searchName').value = '';
  document.getElementById('searchLang').value = '';
  loadAll();
});

loadAll();
