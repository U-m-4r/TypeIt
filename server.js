const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const USERS_FILE = path.join(__dirname, 'users.txt');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  const text = fs.readFileSync(USERS_FILE, 'utf8').trim();
  if (!text) return {};
  const lines = text.split('\n');
  const users = {};
  lines.forEach(line => {
    try {
      const obj = JSON.parse(line);
      users[obj.username] = obj;
    } catch (e) {}
  });
  return users;
}

function appendUser(user) {
  const line = JSON.stringify(user) + '\n';
  fs.appendFileSync(USERS_FILE, line);
}

app.get('/api/users', (req, res) => {
  res.json(readUsers());
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing' });
  const users = readUsers();
  if (users[username]) {
    if (users[username].password === password) return res.json({ ok: true, user: users[username] });
    return res.status(401).json({ error: 'Invalid' });
  }
  const newUser = { username, password, bestWpm: 0 };
  appendUser(newUser);
  res.json({ ok: true, user: newUser });
});

app.post('/api/update', (req, res) => {
  const { username, bestWpm } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing' });
  const users = readUsers();
  if (!users[username]) return res.status(404).json({ error: 'User not found' });
  users[username].bestWpm = Math.max(users[username].bestWpm || 0, Number(bestWpm) || 0);
  // rewrite file
  const data = Object.values(users).map(u => JSON.stringify(u)).join('\n') + '\n';
  fs.writeFileSync(USERS_FILE, data);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log('Server running on', PORT));
