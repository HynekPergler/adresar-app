let contacts = [];

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
      <button onclick="deleteContact(${contact.id})">Smazat</button>
    `;
    list.appendChild(li);
  });
}

async function addContact() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name || !phone || !email) {
    alert('Vyplňte všechna pole.');
    return;
  }

  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, phone, email })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Nepodarilo se pridat kontakt.');
    }

    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';

    await loadContacts();
  } catch (error) {
    console.error(error);
    alert('Chyba pri ukladani kontaktu.');
  }
}

async function deleteContact(id) {
  if (!confirm('Opravdu chcete kontakt smazat?')) {
    return;
  }

  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Nepodarilo se smazat kontakt.');
    }

    await loadContacts();
  } catch (error) {
    console.error(error);
    alert('Chyba pri mazani kontaktu.');
  }
}

loadContacts();