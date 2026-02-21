// ============================================================
//  AWS Cloud Practitioner Study App — Main Application Logic
// ============================================================

// ---- State ----
let progress = loadProgress();
let currentView = 'dashboard';

// Flashcard state
let fcCards = [];
let fcIndex = 0;
let fcCorrect = 0;
let fcWrong = 0;
let fcFlipped = false;

// Quiz state
let quizQuestions = [];
let quizIndex = 0;
let quizCorrect = 0;
let quizWrong = 0;
let quizAnswered = false;
let quizTimer = null;
let quizTimeLeft = 0;
let quizMissedThisSession = [];

// ---- Progress Persistence ----
function loadProgress() {
  try {
    const saved = localStorage.getItem('aws-study-progress');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    quizHistory: [],        // [{date, mode, score, total, correct, domainScores}]
    missedQuestions: [],     // indices of ever-missed questions
    seenQuestions: [],       // indices of seen questions
    cardsStudied: 0,
    lastActiveDate: null,
    streak: 0,
    domainScores: {}        // {domain1: {correct, total}, ...}
  };
}

function saveProgress() {
  try {
    localStorage.setItem('aws-study-progress', JSON.stringify(progress));
  } catch (e) {}
}

function resetProgress() {
  if (confirm('Reset ALL progress? This cannot be undone.')) {
    progress = loadProgress.call(null) || {
      quizHistory: [], missedQuestions: [], seenQuestions: [],
      cardsStudied: 0, lastActiveDate: null, streak: 0, domainScores: {}
    };
    // Actually clear it
    progress = {
      quizHistory: [], missedQuestions: [], seenQuestions: [],
      cardsStudied: 0, lastActiveDate: null, streak: 0, domainScores: {}
    };
    saveProgress();
    updateDashboard();
    updateProgressView();
    alert('Progress reset!');
  }
}

// ---- Streak tracking ----
function updateStreak() {
  const today = new Date().toDateString();
  if (progress.lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (progress.lastActiveDate === yesterday.toDateString()) {
    progress.streak++;
  } else if (progress.lastActiveDate !== today) {
    progress.streak = 1;
  }
  progress.lastActiveDate = today;
  saveProgress();
}

// ---- Navigation ----
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const view = document.getElementById('view-' + viewId);
  if (view) view.classList.add('active');

  const btn = document.querySelector(`[data-view="${viewId}"]`);
  if (btn) btn.classList.add('active');

  currentView = viewId;

  // Reset sub-views
  if (viewId === 'flashcards') {
    document.getElementById('flashcard-categories').classList.remove('hidden');
    document.getElementById('flashcard-session').classList.add('hidden');
  }
  if (viewId === 'quiz') {
    document.getElementById('quiz-selection').classList.remove('hidden');
    document.getElementById('quiz-session').classList.add('hidden');
    document.getElementById('quiz-results').classList.add('hidden');
    if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
  }
  if (viewId === 'dashboard') updateDashboard();
  if (viewId === 'progress') updateProgressView();
  if (viewId === 'quiz') updateQuizCounts();
  if (viewId === 'flashcards') updateFlashcardCounts();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

// ---- Shuffle ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Dashboard ----
function updateDashboard() {
  const history = progress.quizHistory;
  document.getElementById('stat-quizzes').textContent = history.length;

  if (history.length > 0) {
    const avg = Math.round(history.reduce((s, h) => s + h.score, 0) / history.length);
    document.getElementById('stat-avg').textContent = avg + '%';
  } else {
    document.getElementById('stat-avg').textContent = '—';
  }

  document.getElementById('stat-cards').textContent = progress.cardsStudied;
  document.getElementById('stat-streak').textContent = progress.streak;

  // Domain bars
  ['domain1', 'domain2', 'domain3', 'domain4'].forEach(d => {
    const data = progress.domainScores[d];
    const fill = document.getElementById(d + '-fill');
    const pct = document.getElementById(d + '-pct');
    if (data && data.total > 0) {
      const score = Math.round(data.correct / data.total * 100);
      fill.style.width = score + '%';
      fill.style.background = score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
      pct.textContent = score + '%';
    } else {
      fill.style.width = '0%';
      pct.textContent = '—';
    }
  });
}

// ---- Flashcards ----
function updateFlashcardCounts() {
  document.getElementById('count-all').textContent = FLASHCARDS.length + ' cards';
  FLASHCARD_CATEGORIES.forEach(cat => {
    const el = document.getElementById('count-' + cat);
    if (el) {
      el.textContent = FLASHCARDS.filter(c => c.category === cat).length + ' cards';
    }
  });
}

function startFlashcards(category) {
  let cards = category === 'all' ? FLASHCARDS : FLASHCARDS.filter(c => c.category === category);
  fcCards = shuffle(cards);
  fcIndex = 0;
  fcCorrect = 0;
  fcWrong = 0;
  fcFlipped = false;

  if (currentView !== 'flashcards') showView('flashcards');

  document.getElementById('flashcard-categories').classList.add('hidden');
  document.getElementById('flashcard-session').classList.remove('hidden');

  renderFlashcard();
}

function renderFlashcard() {
  if (fcIndex >= fcCards.length) {
    endFlashcardSession();
    return;
  }

  const card = fcCards[fcIndex];
  document.getElementById('fc-category').textContent = card.category;
  document.getElementById('fc-term').textContent = card.term;
  document.getElementById('fc-answer').textContent = card.definition;
  document.getElementById('fc-progress').textContent = `${fcIndex + 1} / ${fcCards.length}`;
  document.getElementById('fc-score').textContent = `✓ ${fcCorrect}  ✗ ${fcWrong}`;

  // Reset card
  const flashcard = document.getElementById('flashcard');
  flashcard.classList.remove('flipped');
  fcFlipped = false;
  document.getElementById('fc-actions').classList.add('hidden');
}

function flipCard() {
  if (fcFlipped) return;
  fcFlipped = true;
  document.getElementById('flashcard').classList.add('flipped');
  document.getElementById('fc-actions').classList.remove('hidden');
}

function markCard(knew) {
  if (knew) {
    fcCorrect++;
  } else {
    fcWrong++;
  }
  progress.cardsStudied++;
  updateStreak();
  saveProgress();

  fcIndex++;
  renderFlashcard();
}

function endFlashcardSession() {
  if (fcCards.length > 0 && (fcCorrect + fcWrong) > 0) {
    const pct = Math.round(fcCorrect / (fcCorrect + fcWrong) * 100);
    alert(`Session complete!\n\n✓ ${fcCorrect} correct\n✗ ${fcWrong} missed\nScore: ${pct}%`);
  }
  document.getElementById('flashcard-categories').classList.remove('hidden');
  document.getElementById('flashcard-session').classList.add('hidden');
  updateFlashcardCounts();
}

// ---- Quiz ----
function updateQuizCounts() {
  ['domain1', 'domain2', 'domain3', 'domain4'].forEach((d, i) => {
    const count = QUESTIONS.filter(q => q.domain === d).length;
    const el = document.getElementById(`d${i + 1}-count`);
    if (el) el.textContent = `${count} questions · ${QUIZ_DOMAINS[i].weight} of exam`;
  });

  const missedEl = document.getElementById('missed-count');
  if (missedEl) {
    missedEl.textContent = `${progress.missedQuestions.length} questions you've gotten wrong`;
  }
}

function startDomainQuiz(domain, limit) {
  let questions;
  if (domain === 'all') {
    questions = shuffle(QUESTIONS);
  } else {
    questions = shuffle(QUESTIONS.filter(q => q.domain === domain));
  }

  if (limit && questions.length > limit) {
    questions = questions.slice(0, limit);
  }

  startQuiz(questions, limit === 65 ? 90 * 60 : 0, domain === 'all' ? (limit === 65 ? 'Full Exam' : 'Quick Quiz') : domain);
}

function startQuickQuiz() {
  startDomainQuiz('all', 20);
}

function startFullExam() {
  startDomainQuiz('all', 65);
}

function startMissedQuiz() {
  if (progress.missedQuestions.length === 0) {
    alert('No missed questions yet! Take some quizzes first.');
    return;
  }

  const questions = shuffle(progress.missedQuestions.map(i => QUESTIONS[i]).filter(Boolean));
  if (questions.length === 0) {
    alert('No missed questions found.');
    return;
  }

  startQuiz(questions, 0, 'Review Missed');
}

function startQuiz(questions, timerSeconds, mode) {
  quizQuestions = questions;
  quizIndex = 0;
  quizCorrect = 0;
  quizWrong = 0;
  quizAnswered = false;
  quizMissedThisSession = [];

  if (currentView !== 'quiz') showView('quiz');

  document.getElementById('quiz-selection').classList.add('hidden');
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-session').classList.remove('hidden');

  // Timer
  const timerEl = document.getElementById('quiz-timer');
  if (timerSeconds > 0) {
    quizTimeLeft = timerSeconds;
    timerEl.classList.remove('hidden');
    updateTimer();
    quizTimer = setInterval(() => {
      quizTimeLeft--;
      updateTimer();
      if (quizTimeLeft <= 0) {
        clearInterval(quizTimer);
        quizTimer = null;
        showResults(mode);
      }
    }, 1000);
  } else {
    timerEl.classList.add('hidden');
    if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
  }

  renderQuestion();
}

function updateTimer() {
  const min = Math.floor(quizTimeLeft / 60);
  const sec = quizTimeLeft % 60;
  document.getElementById('quiz-timer').textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}

function renderQuestion() {
  if (quizIndex >= quizQuestions.length) {
    showResults();
    return;
  }

  quizAnswered = false;
  const q = quizQuestions[quizIndex];
  document.getElementById('quiz-progress').textContent = `${quizIndex + 1} / ${quizQuestions.length}`;
  document.getElementById('quiz-score-live').textContent = `✓ ${quizCorrect}  ✗ ${quizWrong}`;
  document.getElementById('q-text').textContent = q.question;
  document.getElementById('q-explanation').classList.add('hidden');

  const optionsEl = document.getElementById('q-options');
  optionsEl.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => selectAnswer(i));
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(selected) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = quizQuestions[quizIndex];
  const correct = q.answer;
  const qGlobalIndex = QUESTIONS.indexOf(q);

  // Track seen
  if (qGlobalIndex >= 0 && !progress.seenQuestions.includes(qGlobalIndex)) {
    progress.seenQuestions.push(qGlobalIndex);
  }

  // Update domain scores
  if (!progress.domainScores[q.domain]) {
    progress.domainScores[q.domain] = { correct: 0, total: 0 };
  }
  progress.domainScores[q.domain].total++;

  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === correct) btn.classList.add('correct');
    if (i === selected && selected !== correct) btn.classList.add('wrong');
  });

  const resultEl = document.getElementById('q-result');
  if (selected === correct) {
    quizCorrect++;
    resultEl.textContent = '✓ Correct!';
    resultEl.className = 'explanation-result correct';
    progress.domainScores[q.domain].correct++;
  } else {
    quizWrong++;
    resultEl.textContent = '✗ Incorrect';
    resultEl.className = 'explanation-result wrong';
    quizMissedThisSession.push(quizIndex);

    // Track missed globally
    if (qGlobalIndex >= 0 && !progress.missedQuestions.includes(qGlobalIndex)) {
      progress.missedQuestions.push(qGlobalIndex);
    }
  }

  document.getElementById('quiz-score-live').textContent = `✓ ${quizCorrect}  ✗ ${quizWrong}`;
  document.getElementById('q-explain-text').textContent = q.explanation;
  document.getElementById('q-explanation').classList.remove('hidden');

  // Change button text on last question
  const nextBtn = document.getElementById('q-next-btn');
  nextBtn.textContent = quizIndex === quizQuestions.length - 1 ? 'See Results' : 'Next Question →';

  updateStreak();
  saveProgress();
}

function nextQuestion() {
  quizIndex++;
  if (quizIndex >= quizQuestions.length) {
    showResults();
  } else {
    renderQuestion();
    // Scroll to top of question
    document.getElementById('quiz-session').scrollTop = 0;
    window.scrollTo(0, 0);
  }
}

function showResults(mode) {
  if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }

  const total = quizCorrect + quizWrong;
  const pct = total > 0 ? Math.round(quizCorrect / total * 100) : 0;

  // Save to history
  progress.quizHistory.push({
    date: new Date().toISOString(),
    mode: mode || 'Quiz',
    score: pct,
    total: total,
    correct: quizCorrect,
  });
  saveProgress();

  // Render results
  document.getElementById('quiz-session').classList.add('hidden');
  document.getElementById('quiz-results').classList.remove('hidden');

  const scoreEl = document.getElementById('results-score');
  scoreEl.textContent = pct + '%';
  scoreEl.className = 'results-score ' + (pct >= 70 ? 'pass' : 'fail');

  const barEl = document.getElementById('results-bar');
  barEl.style.width = '0%';
  barEl.className = 'results-bar ' + (pct >= 70 ? 'pass' : 'fail');
  setTimeout(() => { barEl.style.width = pct + '%'; }, 100);

  document.getElementById('results-total').textContent = total;
  document.getElementById('results-correct').textContent = quizCorrect;
  document.getElementById('results-wrong').textContent = quizWrong;

  const msgEl = document.getElementById('results-message');
  if (pct >= 90) {
    msgEl.textContent = 'Outstanding! You are exam ready!';
    msgEl.className = 'results-message pass';
  } else if (pct >= 70) {
    msgEl.textContent = 'PASS! Keep studying to strengthen weak areas.';
    msgEl.className = 'results-message pass';
  } else if (pct >= 50) {
    msgEl.textContent = 'Almost there! Focus on the questions you missed.';
    msgEl.className = 'results-message close';
  } else {
    msgEl.textContent = 'Keep studying! Review the cheat sheets and try again.';
    msgEl.className = 'results-message fail';
  }

  // Domain breakdown
  const domainsEl = document.getElementById('results-domains');
  domainsEl.innerHTML = '<h3>Score by Domain</h3>';

  const domainResults = {};
  quizQuestions.forEach((q, i) => {
    if (!domainResults[q.domain]) domainResults[q.domain] = { correct: 0, total: 0 };
    domainResults[q.domain].total++;
    if (i < quizCorrect + quizWrong) {
      // Check if this question was answered correctly
      // We need to track per-question results differently
    }
  });

  // Simplified domain breakdown using global scores for this session
  const sessionDomains = {};
  quizQuestions.forEach((q, idx) => {
    if (!sessionDomains[q.domain]) sessionDomains[q.domain] = { correct: 0, total: 0 };
    if (idx < total) {
      sessionDomains[q.domain].total++;
      if (!quizMissedThisSession.includes(idx)) {
        sessionDomains[q.domain].correct++;
      }
    }
  });

  const domainNames = {
    domain1: 'Cloud Concepts',
    domain2: 'Security',
    domain3: 'Technology',
    domain4: 'Billing'
  };

  Object.keys(sessionDomains).sort().forEach(d => {
    const data = sessionDomains[d];
    const dPct = data.total > 0 ? Math.round(data.correct / data.total * 100) : 0;
    const color = dPct >= 70 ? 'var(--success)' : dPct >= 50 ? 'var(--warning)' : 'var(--danger)';

    const div = document.createElement('div');
    div.className = 'domain-result';
    div.innerHTML = `
      <span>${domainNames[d] || d}</span>
      <div class="domain-result-bar"><div class="domain-result-fill" style="width:${dPct}%; background:${color}"></div></div>
      <span>${dPct}% (${data.correct}/${data.total})</span>
    `;
    domainsEl.appendChild(div);
  });
}

function reviewMissed() {
  if (quizMissedThisSession.length === 0) {
    alert('No missed questions to review!');
    return;
  }

  const missed = quizMissedThisSession.map(i => quizQuestions[i]).filter(Boolean);
  startQuiz(missed, 0, 'Review');
}

function endQuiz() {
  if (quizCorrect + quizWrong > 0) {
    if (!confirm('Quit this quiz? Your progress will be lost.')) return;
  }
  if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
  document.getElementById('quiz-session').classList.add('hidden');
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-selection').classList.remove('hidden');
}

// ---- Progress View ----
function updateProgressView() {
  // Score history
  const historyEl = document.getElementById('score-history');
  if (progress.quizHistory.length === 0) {
    historyEl.innerHTML = '<p class="empty-state">No quizzes taken yet. Start practicing!</p>';
  } else {
    historyEl.innerHTML = '';
    // Show most recent first
    [...progress.quizHistory].reverse().slice(0, 20).forEach(h => {
      const date = new Date(h.date);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div>
          <div class="history-mode">${h.mode || 'Quiz'}</div>
          <div class="history-date">${dateStr}</div>
        </div>
        <div>
          <span class="history-score ${h.score >= 70 ? 'pass' : 'fail'}">${h.score}%</span>
          <span class="history-date"> (${h.correct}/${h.total})</span>
        </div>
      `;
      historyEl.appendChild(div);
    });
  }

  // Coverage
  document.getElementById('total-q-count').textContent = QUESTIONS.length;
  document.getElementById('seen-q-count').textContent = progress.seenQuestions.length;
  document.getElementById('ever-missed-count').textContent = progress.missedQuestions.length;
}

// ---- Init ----
function init() {
  updateDashboard();
  updateFlashcardCounts();
  updateQuizCounts();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
