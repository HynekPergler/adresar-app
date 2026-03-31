const fs = require('fs');
const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Databáze
const dbPath = path.join(__dirname, 'contacts.db');
const db = new Database(dbPath);

// Vytvoření tabulky při startu
db.prepare(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL
  )
`).run();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+\s()-]{6,20}$/.test(phone);
}

// API - načtení všech kontaktů
app.get('/api/contacts', (req, res) => {
  const rows = db.prepare('SELECT * FROM contacts ORDER BY name').all();
  res.json(rows);
});

// API - přidání kontaktu
app.post('/api/contacts', (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Všechna pole jsou povinná.' });
  }

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const trimmedEmail = email.trim();

  if (!isValidEmail(trimmedEmail)) {
    return res.status(400).json({ error: 'Neplatný e-mail.' });
  }

  if (!isValidPhone(trimmedPhone)) {
    return res.status(400).json({ error: 'Neplatné telefonní číslo.' });
  }

  const stmt = db.prepare(`
    INSERT INTO contacts (name, phone, email)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(trimmedName, trimmedPhone, trimmedEmail);

  const newContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newContact);
});

// API - editace kontaktu
app.put('/api/contacts/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Všechna pole jsou povinná.' });
  }

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const trimmedEmail = email.trim();

  if (!isValidEmail(trimmedEmail)) {
    return res.status(400).json({ error: 'Neplatný e-mail.' });
  }

  if (!isValidPhone(trimmedPhone)) {
    return res.status(400).json({ error: 'Neplatné telefonní číslo.' });
  }

  const stmt = db.prepare(`
    UPDATE contacts
    SET name = ?, phone = ?, email = ?
    WHERE id = ?
  `);

  const result = stmt.run(trimmedName, trimmedPhone, trimmedEmail, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Kontakt nebyl nalezen.' });
  }

  const updatedContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
  res.json(updatedContact);
});

// API - smazání kontaktu
app.delete('/api/contacts/:id', (req, res) => {
  const id = Number(req.params.id);

  const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Kontakt nebyl nalezen.' });
  }

  res.json({ success: true });
});

// Export CSV
app.get('/api/contacts/export/csv', (req, res) => {
  const rows = db.prepare('SELECT * FROM contacts ORDER BY name').all();

  const header = 'id,name,phone,email';
  const lines = rows.map(row => {
    const name = `"${String(row.name).replace(/"/g, '""')}"`;
    const phone = `"${String(row.phone).replace(/"/g, '""')}"`;
    const email = `"${String(row.email).replace(/"/g, '""')}"`;
    return `${row.id},${name},${phone},${email}`;
  });

  const csv = [header, ...lines].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
  res.send(csv);
});

// Záloha databáze
app.post('/api/backup', (req, res) => {
  const backupDir = path.join(__dirname, 'contacts-backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  const backupPath = path.join(backupDir, `contacts-${timestamp}.db`);

  fs.copyFileSync(dbPath, backupPath);

  res.json({ success: true, backup: backupPath });
});

app.listen(port, () => {
  console.log(`Server bezi na http://localhost:${port}`);
  console.log(`Databaze: ${dbPath}`);
});
