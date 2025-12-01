# TypeIt - Complete Technical Documentation

## Project Architecture Overview

TypeIt is a **full-stack web application** built with **Node.js/Express** backend and **Vanilla JavaScript** frontend. Here's how everything works together:

---

## 1. Application Flow

### User Journey:

```
1. User visits http://localhost:3000
   ↓
2. Loads index.html → app.js → style.css
   ↓
3. User enters username/password → Clicks Login
   ↓
4. Frontend sends POST request to /api/login
   ↓
5. Server checks users.txt file for user credentials
   ↓
6. If valid/new user → Returns user data
   ↓
7. User selects category, difficulty, clicks Start
   ↓
8. Frontend requests text from /api/text endpoint
   ↓
9. Server returns pre-stored text from textLibrary
   ↓
10. User types → Real-time WPM/Accuracy calculation
    ↓
11. Presses Enter → Results modal shows with graph
    ↓
12. If new high score → Updates via /api/update
```

---

## 2. Backend Architecture (server.js)

### Core Components:

#### A. Express Server Setup

```javascript
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Parse JSON requests
app.use(express.static("public")); // Serve static files
```

- **Port**: 3000 (can be changed via environment variable)
- **Static Files**: Everything in `/public/` folder is accessible directly

#### B. File-Based Database (users.txt)

Instead of a real database, TypeIt uses a text file:

```
// users.txt contains one JSON object per line:
{"username":"Adithi","password":"123","bestWpm":81}
{"username":"user2","password":"pass","bestWpm":45}
```

**Why this approach?**

- ✅ No database setup needed
- ✅ Easy to understand for learning
- ❌ Not scalable for production
- ❌ No encryption (passwords are plain text)

#### C. User Management Functions

**readUsers()** - Loads all users from file:

```javascript
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  const text = fs.readFileSync(USERS_FILE, "utf8").trim();
  const lines = text.split("\n");
  const users = {};
  lines.forEach((line) => {
    const obj = JSON.parse(line);
    users[obj.username] = obj; // Key: username, Value: user object
  });
  return users;
}
```

**appendUser()** - Adds new user to file:

```javascript
function appendUser(user) {
  const line = JSON.stringify(user) + "\n";
  fs.appendFileSync(USERS_FILE, line); // Append to end of file
}
```

---

## 3. API Endpoints Explained

### Endpoint 1: POST `/api/login`

**Purpose**: User login or registration

**Request (from frontend)**:

```javascript
fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "john", password: "123" }),
});
```

**Backend Logic**:

```javascript
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Step 1: Check if username exists
  const users = readUsers();
  if (users[username]) {
    // Step 2a: Verify password
    if (users[username].password === password) {
      res.json({ ok: true, user: users[username] });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  } else {
    // Step 2b: Create new user (auto-register)
    const newUser = { username, password, bestWpm: 0 };
    appendUser(newUser);
    res.json({ ok: true, user: newUser });
  }
});
```

**Response**:

```json
{
  "ok": true,
  "user": {
    "username": "john",
    "password": "123",
    "bestWpm": 0
  }
}
```

---

### Endpoint 2: GET `/api/users`

**Purpose**: Fetch all users for leaderboard

**Request** (from frontend):

```javascript
fetch("/api/users").then((r) => r.json());
```

**Backend Logic**:

```javascript
app.get("/api/users", (req, res) => {
  res.json(readUsers());
});
```

**Response**:

```json
{
  "Adithi": { "username": "Adithi", "password": "123", "bestWpm": 81 },
  "john": { "username": "john", "password": "123", "bestWpm": 45 }
}
```

**Frontend Processing** (app.js):

```javascript
function showLeaderboard() {
  fetch("/api/users")
    .then((r) => r.json())
    .then((users) => {
      const arr = Object.values(users)
        .sort((a, b) => b.bestWpm - a.bestWpm) // Sort by WPM descending
        .slice(0, 10); // Get top 10
      // Display in HTML
    });
}
```

---

### Endpoint 3: POST `/api/update`

**Purpose**: Update user's best WPM score

**Request** (from frontend):

```javascript
fetch("/api/update", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "john", bestWpm: 65 }),
});
```

**Backend Logic**:

```javascript
app.post("/api/update", (req, res) => {
  const { username, bestWpm } = req.body;
  const users = readUsers();

  // Keep only the higher score
  users[username].bestWpm = Math.max(
    users[username].bestWpm || 0,
    Number(bestWpm) || 0
  );

  // Rewrite entire file with updated data
  const data =
    Object.values(users)
      .map((u) => JSON.stringify(u))
      .join("\n") + "\n";
  fs.writeFileSync(USERS_FILE, data);

  res.json({ ok: true });
});
```

**Important**: File is completely rewritten every update (inefficient but simple)

---

### Endpoint 4: POST `/api/text`

**Purpose**: Get typing practice text by category and difficulty

**Request** (from frontend):

```javascript
fetch("/api/text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ category: "Technology", difficulty: "medium" }),
});
```

**Backend Logic**:

```javascript
app.post("/api/text", (req, res) => {
  const { category, difficulty } = req.body;

  // Map difficulty name to array index
  const difficultyMap = { easy: 0, medium: 1, hard: 2 };
  const diffLevel = difficultyMap[difficulty] || 0;

  // Get text for category (default: Technology)
  const categoryTexts = textLibrary[category] || textLibrary["Technology"];

  // Get text for difficulty level
  const text = categoryTexts[diffLevel] || categoryTexts[0];

  res.json({ text });
});
```

**Text Library Structure**:

```javascript
const textLibrary = {
  Technology: [
    // [0] Easy
    "Technology advances every day. Innovation drives progress.",
    // [1] Medium
    "Artificial intelligence is transforming industries...",
    // [2] Hard
    "Quantum computing represents the next frontier...",
  ],
  Sports: [
    // Same pattern: [0] easy, [1] medium, [2] hard
    "Athletes train hard every day. They push their limits.",
    "Athletic training requires dedication...",
    "The Olympic Games showcase...",
  ],
  // ... more categories
};
```

**Response**:

```json
{
  "text": "Technology advances every day. Innovation drives progress."
}
```

---

## 4. Frontend Architecture (app.js)

### Key Variables:

```javascript
let startTime = null; // When test started (milliseconds)
let elapsed = 0; // Time elapsed (seconds)
let finished = false; // Has test finished?
let wordTimes = []; // Array of times for each word
let currentDifficulty = 0; // 0=easy, 1=medium, 2=hard
let user = null; // Current logged-in user object
```

### Main Functions:

#### 1. newParagraph() - Fetch text from backend

```javascript
async function newParagraph() {
  const category = document.getElementById("category").value;
  const difficulty = difficultyLevels[currentDifficulty];

  const res = await fetch("/api/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, difficulty }),
  });

  const data = await res.json();
  const p = data.text;
  updateLiveHighlight("", p); // Display text
}
```

#### 2. showCountdown() - 3-2-1 animation

```javascript
function showCountdown() {
  let count = 3;
  const countdownDiv = document.createElement("div");
  countdownDiv.textContent = count;
  document.body.appendChild(countdownDiv);

  const updateCountdown = () => {
    if (count > 0) {
      countdownDiv.textContent = count;
      count--;
      setTimeout(updateCountdown, 1000);
    } else {
      countdownDiv.remove();
      startTest(); // Begin actual test
    }
  };
  updateCountdown();
}
```

#### 3. startTest() - Initialize timer

```javascript
function startTest() {
  inputEl.disabled = false;
  inputEl.focus();
  startTime = Date.now(); // Record start time
  lastInputTime = startTime;
  elapsed = 0;
  resetTestStats();

  // Update elapsed time every 50ms
  interval = setInterval(() => {
    if (!finished) {
      elapsed = (Date.now() - startTime) / 1000;
    }
  }, 50);
}
```

#### 4. Live WPM/Accuracy Calculation

```javascript
inputEl.addEventListener("input", (e) => {
  if (!startTime || finished) return;

  const userText = e.target.value;
  const origWords = paragraphDiv.textContent.trim().split(/\s+/);
  const userWords = userText.trim().split(/\s+/);

  // Count correct words
  let correctWords = 0;
  for (let i = 0; i < origWords.length; i++) {
    if (userWords[i] === origWords[i]) correctWords++;
  }

  // Calculate accuracy percentage
  const accuracy = Math.round((100 * correctWords) / origWords.length);

  // Calculate WPM
  const totalWordsTyped = userWords.filter(Boolean).length;
  const minutes = elapsed / 60 || 1 / 600;
  const wpm = Math.round(totalWordsTyped / minutes);

  // Update display
  document.getElementById("accuracy").textContent = accuracy + "%";
  document.getElementById("wpm").textContent = wpm;
});
```

#### 5. Test Submission (Enter Key)

```javascript
inputEl.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && !finished) {
    e.preventDefault();
    finished = true;
    clearInterval(interval);

    // Calculate final stats
    const text = inputEl.value;
    const target = paragraphDiv.textContent;
    // ... calculate wpm, accuracy, etc.

    // Show results modal with graph
    showResultsModal(stats);

    // Update best score if needed
    if (wpm > user.bestWpm) {
      user.bestWpm = wpm;
      await api("update", { username: user.username, bestWpm: wpm });
    }
  }
});
```

---

## 5. Graph Rendering (Canvas API)

### How the graph works:

```javascript
function drawResultsGraph(times) {
  const ctx = resultsGraph.getContext("2d"); // Get 2D drawing context

  // Clear canvas
  ctx.clearRect(0, 0, resultsGraph.width, resultsGraph.height);

  // Find max value for scaling
  const max = Math.max(...times);

  // Define graph area (with padding for axes)
  const leftPad = 50,
    topPad = 20;
  const graphW = resultsGraph.width - leftPad - 20;
  const graphH = resultsGraph.height - topPad - 50;

  // Draw line connecting data points
  ctx.strokeStyle = "#0b63ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  times.forEach((t, i) => {
    // Convert data point to pixel position
    const x = leftPad + (i / times.length) * graphW;
    const y = topPad + graphH - (t / max) * graphH;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw dots on each point
  ctx.fillStyle = "#0b63ff";
  times.forEach((t, i) => {
    const x = leftPad + (i / times.length) * graphW;
    const y = topPad + graphH - (t / max) * graphH;
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Draw axes and labels
  ctx.strokeStyle = "#666";
  ctx.beginPath();
  ctx.moveTo(leftPad, topPad + graphH);
  ctx.lineTo(leftPad + graphW, topPad + graphH); // X-axis
  ctx.moveTo(leftPad, topPad);
  ctx.lineTo(leftPad, topPad + graphH); // Y-axis
  ctx.stroke();
}
```

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│            BROWSER (Frontend)                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ index.html (Structure)                        │ │
│  ├────────────────────────────────────────────────┤ │
│  │ style.css (Styling)                           │ │
│  ├────────────────────────────────────────────────┤ │
│  │ app.js (Logic & Event Listeners)              │ │
│  │ - Handles user input                          │ │
│  │ - Real-time WPM/Accuracy calculation          │ │
│  │ - Makes API calls                             │ │
│  │ - Renders results graph                       │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                      ↕ HTTP Requests
┌─────────────────────────────────────────────────────┐
│          SERVER (Node.js/Express)                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ server.js                                     │ │
│  ├────────────────────────────────────────────────┤ │
│  │ POST /api/login                               │ │
│  │  ↓ checks/creates user                        │ │
│  │ GET /api/users                                │ │
│  │  ↓ returns all users                          │ │
│  │ POST /api/update                              │ │
│  │  ↓ updates user best WPM                      │ │
│  │ POST /api/text                                │ │
│  │  ↓ returns text from textLibrary              │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                      ↕ Read/Write
┌─────────────────────────────────────────────────────┐
│         FILE SYSTEM                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ users.txt (User Data Storage)                 │ │
│  │ {"username":"john","password":"123"...}       │ │
│  │ {"username":"jane","password":"456"...}       │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 7. Security Issues (For Learning)

⚠️ **This app is for learning only. DO NOT use in production:**

1. **Passwords in plain text** - Should be hashed (bcrypt)
2. **No HTTPS** - Data sent unencrypted
3. **No input validation** - Vulnerable to injection
4. **API key exposed** - Never commit secrets to git
5. **No rate limiting** - Easy to abuse
6. **No CORS** - Any website can call your API

---

## 8. How to Improve This

### Next Steps:

1. **Add real database** (MongoDB, PostgreSQL)
2. **Hash passwords** (bcrypt, argon2)
3. **Add input validation** (express-validator)
4. **Integrate real LLM API** (OpenAI, Anthropic, Groq)
5. **Add authentication tokens** (JWT)
6. **Deploy to cloud** (Heroku, Railway, Vercel)

---

## 9. Testing the API

### Using curl (PowerShell):

```powershell
# Login
$body = @{username="testuser"; password="123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/login" -Method POST -Body $body -ContentType "application/json"

# Get text
$body = @{category="Technology"; difficulty="easy"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/text" -Method POST -Body $body -ContentType "application/json"
```

### Using JavaScript (DevTools Console):

```javascript
// Login
fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "test", password: "123" }),
})
  .then((r) => r.json())
  .then(console.log);

// Get text
fetch("/api/text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ category: "Technology", difficulty: "medium" }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

**Summary**: TypeIt demonstrates full-stack web development concepts including REST APIs, file I/O, real-time calculations, and canvas graphics - all with simple, readable code perfect for learning!
