// const counter = document.querySelector(".counter");
// let count = 0;
// setInterval(() => {
//  if(count == 92) {
//   clearInterval(count);
//  }else {
//   count+=1;
//   counter.textContent = count + "%";
//  }
// }, 42);

const loginForm = document.getElementById('login-form');
const assetForm = document.getElementById('asset-form');
const assetsTable = document.getElementById('assets-table');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    location.reload();
  } else {
    alert('Invalid email or password');
  }
});

assetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('asset-name').value;
  const amount = document.getElementById('asset-amount').value;
  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ name, amount }),
  });
  if (response.ok) {
    const data = await response.json();
    addAssetToTable(data);
    assetForm.reset();
  } else {
    alert('Error adding asset');
  }
});

function addAssetToTable(asset) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <th scope="row">${asset.name}</th>
    <td>${asset.amount}</td>
    <td>
      <button class="btn btn-danger" onclick="removeAsset('${asset._id}')">Remove</button>
    </td>
  `;
  assetsTable.appendChild(row);
}

async function removeAsset(id) {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  });
  if (response.ok) {
    location.reload();
  } else {
    alert('Error removing asset');
  }
}

async function fetchAssets() {
  const response = await fetch('/api/assets', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
  if (response.ok) {
    const assets = await response.json();
    assets.forEach(addAssetToTable);
  } else {
    alert('Error fetching assets');
  }
}

if (localStorage.getItem('token')) {
  fetchAssets();
}