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

  const stmt = db.prepare(`
    INSERT INTO contacts (name, phone, email)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(name.trim(), phone.trim(), email.trim());

  const newContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newContact);
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

app.listen(port, () => {
  console.log(`Server bezi na http://localhost:${port}`);
  console.log(`Databaze: ${dbPath}`);
});