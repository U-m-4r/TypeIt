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

// Text library for each category with easy, medium, hard variants
const textLibrary = {
  'Technology': [
    'Technology advances every day. Innovation drives progress.',
    'Artificial intelligence is transforming industries and changing how we work and live. Machine learning algorithms can now analyze vast amounts of data to identify patterns and make intelligent predictions.',
    'Quantum computing represents the next frontier in computational technology. Unlike classical computers that use bits, quantum computers harness the power of quantum bits to solve complex problems exponentially faster. The potential applications range from drug discovery to financial modeling and cryptography.'
  ],
  'Sports': [
    'Athletes train hard every day. They push their limits.',
    'Athletic training requires dedication, discipline, and consistent practice to achieve peak performance. Champions combine physical conditioning with mental preparation to excel in their sport.',
    'The Olympic Games showcase the pinnacle of human athletic achievement. Athletes from around the world compete at the highest level, breaking records and pushing the boundaries of what is physically possible. The dedication required to reach this level demands years of sacrifice, training, and unwavering commitment.'
  ],
  'Anime': [
    'Anime is very popular now. It tells great stories.',
    'Anime has become a global phenomenon, captivating audiences with unique storytelling and stunning visual artistry. From action-packed adventures to intimate character dramas, anime offers something for everyone.',
    'The anime industry has evolved dramatically over the past few decades, transitioning from niche entertainment to mainstream media consumed by millions worldwide. Modern anime production combines traditional animation techniques with cutting-edge digital technology, creating visually breathtaking experiences. The diverse genres and innovative narratives continue to attract new audiences and inspire creators globally.'
  ],
  'Horror story': [
    'Dark clouds gathered. Strange sounds echoed.',
    'The old mansion stood abandoned for decades, its windows dark and unwelcoming. Locals whispered tales of strange occurrences within its walls, warning others to stay away after sunset.',
    'Legend had it that the mansion held secrets buried deep within its crumbling foundation. Visitors who dared to explore its corridors reported hearing unexplained whispers and witnessing shadowy figures that vanished when approached. The town historians refused to speak about what happened there, but occasional screams echoing from the structure on moonless nights kept curious souls away.'
  ],
  'Science': [
    'Science explores the natural world.',
    'The scientific method relies on observation, hypothesis, experimentation, and analysis to draw meaningful conclusions. Scientists across the globe collaborate to understand phenomena from the microscopic world of atoms to the vastness of the universe.',
    'Modern scientific discovery integrates knowledge from multiple disciplines including physics, chemistry, biology, and geology. Breakthrough innovations in genetics, neuroscience, and materials science are reshaping our understanding of life and matter. The interdisciplinary approach allows researchers to tackle complex problems that transcend traditional boundaries.'
  ],
  'History': [
    'History teaches us lessons.',
    'Throughout history, civilizations have risen and fallen, leaving behind artifacts and narratives that shape our understanding of the past. Historians analyze these records to piece together the story of human development.',
    'The study of history reveals patterns of human behavior across centuries and continents. From ancient empires to modern democracies, each era contributed uniquely to our contemporary world. Understanding historical context helps us make informed decisions about our future and appreciate the struggles and achievements of those who came before us.'
  ],
  'Travel': [
    'Travel opens new doors.',
    'Exploring new destinations exposes travelers to diverse cultures, cuisines, and perspectives. Each journey offers opportunities to create lasting memories and gain fresh insights into different ways of living.',
    'Traveling to unfamiliar places challenges our assumptions and broadens our worldview. Whether trekking through mountains, exploring ancient ruins, or wandering through bustling city streets, each adventure provides valuable experiences. The connections made with locals and fellow travelers often prove more valuable than any souvenir collected along the way.'
  ],
  'Food': [
    'Food brings joy and health.',
    'Culinary traditions reflect the culture and geography of each region around the world. From traditional recipes passed down through generations to innovative fusion cuisine, food tells the story of communities.',
    'The art of cooking combines science, tradition, and creativity to transform raw ingredients into memorable dishes. Chefs around the world experiment with flavors, techniques, and presentations to delight the senses. Food brings people together, fostering connection and celebration across all boundaries and cultures.'
  ]
};

app.post('/api/text', (req, res) => {
  const { category, difficulty } = req.body;
  if (!category) return res.status(400).json({ error: 'Missing category' });
  
  const difficultyMap = { 'easy': 0, 'medium': 1, 'hard': 2 };
  const diffLevel = difficultyMap[difficulty] || Math.floor(Math.random() * 3);
  
  const categoryTexts = textLibrary[category] || textLibrary['Technology'];
  const text = categoryTexts[diffLevel] || categoryTexts[0];
  
  res.json({ text });
});

app.listen(PORT, () => console.log('Server running on', PORT));
