let contacts = [];
let editingId = null;

async function loadContacts() {
  try {
    const response = await fetch('/api/contacts');
    if (!response.ok) {
      throw new Error('Nepodarilo se nacist kontakty.');
    }

    contacts = await response.json();
    renderContacts();
  } catch (error) {
    console.error(error);
    alert('Chyba pri nacitani kontaktu.');
  }
}

function renderContacts() {
  const list = document.getElementById('contactList');
  const searchValue = document.getElementById('search').value.toLowerCase().trim();

  list.innerHTML = '';

  const filtered = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchValue) ||
    contact.phone.toLowerCase().includes(searchValue) ||
    contact.email.toLowerCase().includes(searchValue)
  );

  if (filtered.length === 0) {
    list.innerHTML = '<li>Žádné kontakty.</li>';
    return;
  }

  filtered.forEach(contact => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="contact-name">${contact.name}</div>
      <div>Telefon: ${contact.phone}</div>
      <div>E-mail: ${contact.email}</div>
      <div class="actions">
        <button onclick="startEditContact(${contact.id})">Upravit</button>
        <button onclick="deleteContact(${contact.id})">Smazat</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function validateForm(name, phone, email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+\s()-]{6,20}$/;

  if (!name || !phone || !email) {
    alert('Vyplňte všechna pole.');
    return false;
  }

  if (!emailRegex.test(email)) {
    alert('Neplatný e-mail.');
    return false;
  }

  if (!phoneRegex.test(phone)) {
    alert('Neplatné telefonní číslo.');
    return false;
  }

  return true;
}

async function addContact() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!validateForm(name, phone, email)) {
    return;
  }

  try {
    const url = editingId ? `/api/contacts/${editingId}` : '/api/contacts';
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, phone, email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Operace se nepodarila.');
    }

    clearForm();
    await loadContacts();
  } catch (error) {
    console.error(error);
    alert(error.message || 'Chyba pri ukladani kontaktu.');
  }
}

function startEditContact(id) {
  const contact = contacts.find(c => c.id === id);
  if (!contact) {
    return;
  }

  editingId = id;
  document.getElementById('name').value = contact.name;
  document.getElementById('phone').value = contact.phone;
  document.getElementById('email').value = contact.email;
  document.getElementById('saveButton').textContent = 'Uložit změny';
  document.getElementById('cancelEditButton').style.display = 'inline-block';
}

function clearForm() {
  editingId = null;
  document.getElementById('name').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('email').value = '';
  document.getElementById('saveButton').textContent = 'Přidat kontakt';
  document.getElementById('cancelEditButton').style.display = 'none';
}

async function deleteContact(id) {
  if (!confirm('Opravdu chcete kontakt smazat?')) {
    return;
  }

  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Nepodarilo se smazat kontakt.');
    }

    if (editingId === id) {
      clearForm();
    }

    await loadContacts();
  } catch (error) {
    console.error(error);
    alert(error.message || 'Chyba pri mazani kontaktu.');
  }
}

function exportCsv() {
  window.location.href = '/api/contacts/export/csv';
}

async function createBackup() {
  try {
    const response = await fetch('/api/backup', { method: 'POST' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Nepodarilo se vytvorit zalohu.');
    }

    alert('Zaloha vytvorena:\n' + data.backup);
  } catch (error) {
    console.error(error);
    alert(error.message || 'Chyba pri zaloze databaze.');
  }
}

loadContacts();
