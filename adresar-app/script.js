let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

function saveContacts() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

function renderContacts() {
  const list = document.getElementById("contactList");
  const search = document.getElementById("search").value.toLowerCase();

  list.innerHTML = "";

  const filtered = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search)
  );

  filtered.forEach((contact, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="contact-name">${contact.name}</div>
      <div>Telefon: ${contact.phone}</div>
      <div>E-mail: ${contact.email}</div>
      <button onclick="deleteContact(${index})">Smazat</button>
    `;
    list.appendChild(li);
  });
}

function addContact() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !phone || !email) {
    alert("Vyplňte všechna pole.");
    return;
  }

  contacts.push({ name, phone, email });
  saveContacts();
  renderContacts();

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
}

function deleteContact(index) {
  contacts.splice(index, 1);
  saveContacts();
  renderContacts();
}

renderContacts();
