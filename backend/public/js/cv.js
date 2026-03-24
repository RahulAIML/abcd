const msg = document.getElementById('msg');
const details = document.getElementById('cvDetails');

function showMessage(text) {
  msg.textContent = text;
}

function getId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

const id = getId();
if (!id) {
  showMessage('No ID found');
} else {
  showMessage('Loading...');
  fetch('/api/cvs/' + id)
    .then((res) => res.json())
    .then((data) => {
      if (data.message) {
        showMessage(data.message);
        return;
      }
      showMessage('');
      details.innerHTML = `
        <div class="card">
          <strong>${data.name || 'No name'}</strong><br>
          <span class="small">${data.email || ''}</span><br>
          <div><b>Key Programming:</b> ${data.keyprogramming || ''}</div>
          <div><b>Education:</b> ${data.education || ''}</div>
          <div><b>Profile:</b> ${data.profile || ''}</div>
          <div><b>URL Links:</b> ${data.URLlinks || ''}</div>
        </div>
      `;
    })
    .catch((err) => {
      console.log(err);
      showMessage('Error loading');
    });
}
