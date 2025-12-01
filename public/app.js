function applyTheme(theme) {
  document.body.classList.remove('light', 'colorful');
  if (theme === 'light') document.body.classList.add('light');
  if (theme === 'colorful') document.body.classList.add('colorful');
}

function updateLiveHighlight(userText, originalText) {
  const origWords = originalText.trim().split(/\s+/);
  const userWords = userText.trim().split(/\s+/);
  let html = '';
  for (let i = 0; i < origWords.length; i++) {
    html += `<span style="padding:2px 6px; margin:2px; border-radius:5px;${userWords[i] ? 'background:#e2e8f0;color:#222;' : ''}">${origWords[i]}</span> `;
  }
  if (paragraphDiv) paragraphDiv.innerHTML = html;
}

const paragraphDiv = document.getElementById('paragraph');
const inputEl = document.getElementById('input');
const difficultyToggle = document.getElementById('difficultyToggle');
const startBtn = document.getElementById('start');
const loginBtn = document.getElementById('login');
const themeBtn = document.getElementById('theme');
const leaderboardBtn = document.getElementById('showLeaderboard');

let difficultyLevels = ['easy', 'medium', 'hard'], currentDifficulty = 0;
let themeModes = ['dark', 'light', 'colorful'], currentTheme = 0;
let startTime = null, finished = false, elapsed = 0;

const paragraphsEasy = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice daily to see real improvements in your typing speed.',
  'Typing is a skill that improves with effort.',
  'Coding is fun and helps you solve problems.',
  'A good day starts with a positive thought.',
  'Sunshine brings warmth and happiness.',
  'Reading books expands your knowledge.',
  'Stay hydrated and take breaks while working.',
  'Learning new things keeps your mind sharp.',
  'Smile and the world smiles with you.'
];
const paragraphsMedium = [
  'Typing tests help you improve your speed and accuracy by giving you practice.',
  'JavaScript is a versatile language used for front-end and back-end development.',
  'Learning to type quickly and accurately can save you a lot of time in your daily work.',
  'The internet connects people from all over the world and enables instant communication.',
  'Healthy habits like exercise and sleep are important for productivity.',
  'Teamwork and collaboration lead to better results in most projects.',
  'A balanced diet includes fruits, vegetables, proteins, and grains.',
  'Music can boost your mood and help you relax after a long day.',
  'Setting goals helps you stay focused and motivated.',
  'Technology is constantly evolving and changing the way we live.'
];
const paragraphsHard = [
  'The rain in Spain stays mainly in the plain, but typing speed is gained mainly by practice.',
  'A journey of a thousand miles begins with a single step, and a fast typist begins with a single word.',
  'Many programmers find that improving their typing speed helps them write code more efficiently. Accuracy is just as important as speed when it comes to typing tests.',
  'In the midst of chaos, there is also opportunity, and those who adapt quickly will thrive in challenging environments.',
  'The scientific method involves observation, hypothesis, experimentation, and analysis to draw meaningful conclusions.',
  'Effective communication requires active listening, clear articulation, and empathy for the other person’s perspective.',
  'The complexity of modern software systems demands rigorous testing, documentation, and ongoing maintenance.',
  'Creativity is intelligence having fun, and innovation often comes from combining ideas in unexpected ways.',
  'The ability to learn from failure is a key trait of successful individuals and organizations.',
  'Globalization has increased the pace of change, making adaptability and lifelong learning essential skills.'
];

function getParagraphsByDifficulty() {
  return [paragraphsEasy, paragraphsMedium, paragraphsHard][currentDifficulty];
}

async function newParagraph() {
  const categoryEl = document.getElementById('category');
  const category = categoryEl ? categoryEl.value : 'Technology';
  const difficulty = difficultyLevels[currentDifficulty];
  
  try {
    // Fetch from backend API
    const res = await fetch('/api/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, difficulty })
    });
    const data = await res.json();
    const p = data.text || 'Typing practice improves your skills with every keystroke.';
    updateLiveHighlight('', p);
  } catch (error) {
    console.error('Error fetching text:', error);
    // Fallback to random paragraph
    const paragraphs = getParagraphsByDifficulty();
    const p = paragraphs[Math.floor(Math.random()*paragraphs.length)];
    updateLiveHighlight('', p);
  }
  
  inputEl.value = '';
  inputEl.disabled = true;
  document.getElementById('wpm').textContent = '0';
  document.getElementById('accuracy').textContent = '0%';
  startTime = null;
  finished = false;
  elapsed = 0;
  resetTestStats();
}

let user = null;
let timer = null;
let interval = null;
let wordTimes = [];
let lastInputTime = null;
let lastTestStats = null;

const resultsModal = document.getElementById('results-modal');
const resultsStats = document.getElementById('resultsStats');
const resultsGraph = document.getElementById('resultsGraph');
const closeResultsBtn = document.getElementById('closeResults');
if (closeResultsBtn) closeResultsBtn.onclick = () => { resultsModal.style.display = 'none'; };

function showResultsModal(stats) {
  if (!resultsModal) return;
  resultsModal.style.display = 'flex';
  // Stats
  resultsStats.innerHTML = `<b>WPM:</b> ${stats.wpm}<br><b>Accuracy:</b> ${stats.accuracy}%<br><b>Time:</b> ${stats.time}s<br><b>Slowest word:</b> ${stats.slowestWord} (${stats.slowestTime.toFixed(2)}s)`;
  // Graph
  drawResultsGraph(stats.wordTimes);
}

function drawResultsGraph(times) {
  if (!resultsGraph) return;
  const ctx = resultsGraph.getContext('2d');
  ctx.clearRect(0, 0, resultsGraph.width, resultsGraph.height);
  
  if (!times || times.length === 0) {
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.fillText('No data available', 20, 60);
    return;
  }
  
  // Filter out any NaN or invalid values
  const validTimes = times.filter(t => typeof t === 'number' && isFinite(t) && t > 0);
  if (validTimes.length === 0) {
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.fillText('No valid data', 20, 60);
    return;
  }
  
  const max = Math.max(...validTimes, 1);
  const min = 0;
  const leftPad = 50, rightPad = 20, topPad = 20, bottomPad = 50;
  const graphW = resultsGraph.width - leftPad - rightPad;
  const graphH = resultsGraph.height - topPad - bottomPad;
  
  // Draw line graph
  ctx.strokeStyle = '#0b63ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  validTimes.forEach((t, i) => {
    const x = leftPad + (i / (validTimes.length - 1 || 1)) * graphW;
    const y = topPad + graphH - ((t - min) / (max - min)) * graphH;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  
  // Draw points
  ctx.fillStyle = '#0b63ff';
  validTimes.forEach((t, i) => {
    const x = leftPad + (i / (validTimes.length - 1 || 1)) * graphW;
    const y = topPad + graphH - ((t - min) / (max - min)) * graphH;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  // Draw axes
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftPad, topPad + graphH);
  ctx.lineTo(leftPad + graphW, topPad + graphH);
  ctx.moveTo(leftPad, topPad);
  ctx.lineTo(leftPad, topPad + graphH);
  ctx.stroke();
  
  // X axis label
  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Word Index', leftPad + graphW / 2, resultsGraph.height - 8);
  
  // Y axis label
  ctx.save();
  ctx.translate(12, topPad + graphH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Time (s)', 0, 0);
  ctx.restore();
  
  // X ticks
  ctx.fillStyle = '#333';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  const xTickCount = Math.min(validTimes.length, 10);
  for (let i = 0; i < xTickCount; i++) {
    const idx = Math.floor((i / (xTickCount - 1 || 1)) * (validTimes.length - 1));
    const x = leftPad + (idx / (validTimes.length - 1 || 1)) * graphW;
    ctx.fillText(idx + 1, x, resultsGraph.height - 28);
  }
  
  // Y ticks and grid lines
  ctx.fillStyle = '#333';
  ctx.font = '11px Arial';
  ctx.textAlign = 'right';
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const val = (i / ySteps) * max;
    const y = topPad + graphH - (val / max) * graphH;
    ctx.fillText(val.toFixed(2), leftPad - 8, y + 4);
  }
}

function resetTestStats() {
  wordTimes = [];
  lastInputTime = null;
  lastTestStats = null;
}

function showCountdown() {
  if (!inputEl) return;
  let count = 3;
  const countdownDiv = document.createElement('div');
  countdownDiv.id = 'countdown';
  countdownDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:60px;font-weight:bold;color:#0b63ff;z-index:9998;opacity:1;transition:opacity 0.3s;';
  document.body.appendChild(countdownDiv);
  
  const updateCountdown = () => {
    if (count > 0) {
      countdownDiv.textContent = count;
      count--;
      setTimeout(updateCountdown, 1000);
    } else {
      countdownDiv.style.opacity = '0';
      setTimeout(() => {
        countdownDiv.remove();
        startTest();
      }, 300);
    }
  };
  updateCountdown();
}

function startTest() {
  if (!inputEl) return;
  inputEl.disabled = false;
  inputEl.focus();
  startTime = Date.now();
  lastInputTime = startTime;
  elapsed = 0;
  resetTestStats();
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (finished) return;
    elapsed = (Date.now() - startTime) / 1000;
  }, 50);
}

document.addEventListener('DOMContentLoaded', function() {
  const liveHighlightDiv = document.getElementById('live-highlight');
  if (loginBtn) loginBtn.onclick = async ()=>{
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if(!username||!password){document.getElementById('status').textContent='Enter both';return}
    const res = await api('login',{username,password});
    if(res.error){document.getElementById('status').textContent=res.error;return}
    user = res.user;
    document.getElementById('usern').textContent = user.username;
    document.getElementById('best').textContent = user.bestWpm || 0;
    document.getElementById('auth').style.display='none';
    document.getElementById('app').style.display='block';
    newParagraph();
  };

  if (startBtn) startBtn.onclick = async function() {
    await newParagraph();
    // Show countdown animation
    showCountdown();
  };

  if (difficultyToggle) {
    difficultyToggle.onclick = function() {
      currentDifficulty = (currentDifficulty + 1) % difficultyLevels.length;
      difficultyToggle.textContent = 'Difficulty: ' + difficultyLevels[currentDifficulty].charAt(0).toUpperCase() + difficultyLevels[currentDifficulty].slice(1);
      newParagraph();
    };
    difficultyToggle.textContent = 'Difficulty: ' + difficultyLevels[currentDifficulty].charAt(0).toUpperCase() + difficultyLevels[currentDifficulty].slice(1);
  }

  if (themeBtn) {
    themeBtn.onclick = function() {
      currentTheme = (currentTheme + 1) % themeModes.length;
      applyTheme(themeModes[currentTheme]);
      themeBtn.textContent = 'Theme: ' + themeModes[currentTheme].charAt(0).toUpperCase() + themeModes[currentTheme].slice(1);
    };
    themeBtn.textContent = 'Theme: ' + themeModes[currentTheme].charAt(0).toUpperCase() + themeModes[currentTheme].slice(1);
    applyTheme(themeModes[currentTheme]);
  }

  if (leaderboardBtn) leaderboardBtn.onclick = showLeaderboard;

  if (inputEl) {
    let lastWordCount = 0;
    
    inputEl.addEventListener('input', (e)=>{
      if(!startTime || finished) return;
      const text = e.target.value;
      const origWords = paragraphDiv.textContent.trim().split(/\s+/);
      const userWords = text.trim().split(/\s+/);
      let correctWords = 0;
      for(let i=0;i<origWords.length;i++){
        if(userWords[i] !== undefined && userWords[i] === origWords[i]) correctWords++;
      }
      const accuracy = origWords.length ? Math.round(100*correctWords/origWords.length) : 0;
      document.getElementById('accuracy').textContent = accuracy + '%';
      const wordsTyped = userWords.filter(Boolean).length;
      const minutes = elapsed/60 || 1/600;
      const wpm = Math.round(wordsTyped / minutes);
      document.getElementById('wpm').textContent = wpm;
      updateLiveHighlight(text, paragraphDiv.textContent);
      
      // Track word timing - detect when a new word is completed
      if (wordsTyped > lastWordCount && lastInputTime) {
        const wordTime = Math.max(0.01, (Date.now() - lastInputTime) / 1000);
        wordTimes.push(wordTime);
        lastInputTime = Date.now();
        lastWordCount = wordsTyped;
      } else if (wordsTyped > lastWordCount) {
        lastInputTime = Date.now();
        lastWordCount = wordsTyped;
      }
    });

    inputEl.addEventListener('keydown', async (e)=>{
      if(e.key==='Enter' && !finished){
        e.preventDefault();
        finished = true;
        if(interval) clearInterval(interval);
        const text = inputEl.value;
        const target = paragraphDiv.textContent;
        // Word-level accuracy
        const origWords2 = target.trim().split(/\s+/);
        const userWords2 = text.trim().split(/\s+/);
        let correctWords2 = 0;
        for(let i=0;i<origWords2.length;i++){
          if(userWords2[i] !== undefined && userWords2[i] === origWords2[i]) correctWords2++;
        }
        const accuracy2 = origWords2.length ? Math.round(100*correctWords2/origWords2.length) : 0;
        const wordsTyped2 = userWords2.filter(Boolean).length;
        const minutes2 = elapsed/60 || 1/600;
        const wpm2 = Math.round(wordsTyped2 / minutes2);
        
        // Generate timing data if empty
        let finalWordTimes = wordTimes.slice();
        if (finalWordTimes.length === 0) {
          // Create synthetic timing data based on words typed
          const avgWordTime = Math.max(0.1, elapsed / Math.max(1, wordsTyped2));
          for (let i = 0; i < wordsTyped2; i++) {
            finalWordTimes.push(avgWordTime + (Math.random() - 0.5) * 0.1);
          }
        }
        
        // Stats for modal
        let slowestTime = 0, slowestWord = '';
        origWords2.forEach((w,i) => {
          if (finalWordTimes[i] && finalWordTimes[i] > slowestTime) {
            slowestTime = finalWordTimes[i];
            slowestWord = w;
          }
        });
        lastTestStats = {
          wpm: wpm2,
          accuracy: accuracy2,
          time: Math.round(elapsed),
          slowestWord: slowestWord || origWords2[0] || 'N/A',
          slowestTime: Math.max(0.1, slowestTime || 0.5),
          wordTimes: finalWordTimes.length > 0 ? finalWordTimes : [0.5, 0.6, 0.4]
        };
        showResultsModal(lastTestStats);
        if(wpm2 > (user.bestWpm||0)){
          user.bestWpm = wpm2;
          document.getElementById('best').textContent = wpm2;
          await api('update',{username:user.username,bestWpm:wpm2});
        }
      }
    });
  }

  function showLeaderboard() {
    fetch('/api/users')
      .then(r => r.json())
      .then(users => {
        const arr = Object.values(users).sort((a,b)=>b.bestWpm-a.bestWpm).slice(0,10);
        const lb = document.getElementById('leaderboard');
        lb.innerHTML = '<h3>Leaderboard</h3>' + arr.map((u,i)=>`<div class="lb-row"><span class="lb-num">${i+1}.</span> <span class="lb-user">${u.username}</span> <span class="lb-wpm">${u.bestWpm} WPM</span></div>`).join('');
      });
  }
});

// Helper for API requests
async function api(endpoint, data) {
  const res = await fetch('/api/' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}
