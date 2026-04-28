import { electionQuiz } from './quizData.js';

document.addEventListener('DOMContentLoaded', () => {
  const welcomeView = document.getElementById('welcome-view');
  const quizView = document.getElementById('quiz-view');
  const resultView = document.getElementById('result-view');
  
  const usernameInput = document.getElementById('username-input');
  const startBtn = document.getElementById('start-btn');
  
  const questionText = document.getElementById('question-text');
  const optionsGrid = document.getElementById('options-grid');
  const currentQNum = document.getElementById('current-q-num');
  const currentScoreEl = document.getElementById('current-score');
  const progressFill = document.getElementById('progress-fill');
  
  const explanationBox = document.getElementById('explanation-box');
  const explanationText = document.getElementById('explanation-text');
  const nextBtn = document.getElementById('next-btn');
  
  const resultGreeting = document.getElementById('result-greeting');
  const finalPoints = document.getElementById('final-points');
  const rankBadge = document.getElementById('rank-badge');

  let currentIdx = 0;
  let score = 0;
  let userName = "Citizen";

  startBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) {
      alert("Please enter your name, Citizen!");
      return;
    }
    userName = name;
    welcomeView.style.display = 'none';
    quizView.style.display = 'block';
    loadQuestion();
  };

  const loadQuestion = () => {
    const q = electionQuiz[currentIdx];
    questionText.textContent = q.question;
    currentQNum.textContent = `Question ${currentIdx + 1}/10`;
    currentScoreEl.textContent = score;
    progressFill.style.width = `${((currentIdx + 1) / 10) * 100}%`;
    
    explanationBox.style.display = 'none';
    optionsGrid.innerHTML = '';
    
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn-option';
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(i, btn);
      optionsGrid.appendChild(btn);
    });
  };

  const handleAnswer = (selectedIdx, btn) => {
    const q = electionQuiz[currentIdx];
    const isCorrect = selectedIdx === q.correct;
    
    // Disable all
    const allBtns = optionsGrid.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);
    
    if (isCorrect) {
      score += 100;
      btn.style.background = '#dcfce7';
      btn.style.borderColor = '#22c55e';
      currentScoreEl.textContent = score;
    } else {
      btn.style.background = '#fee2e2';
      btn.style.borderColor = '#ef4444';
      allBtns[q.correct].style.background = '#dcfce7';
      allBtns[q.correct].style.borderColor = '#22c55e';
    }

    explanationText.textContent = q.explanation;
    explanationBox.style.display = 'block';
  };

  nextBtn.onclick = () => {
    if (currentIdx < 9) {
      currentIdx++;
      loadQuestion();
    } else {
      showFinalResult();
    }
  };

  const showFinalResult = () => {
    quizView.style.display = 'none';
    resultView.style.display = 'block';
    
    resultGreeting.textContent = `${userName}, you are a...`;
    finalPoints.textContent = score;
    
    if (score >= 900) rankBadge.textContent = 'Democracy Scholar 🎓';
    else if (score >= 600) rankBadge.textContent = 'Civic Leader 🇮🇳';
    else rankBadge.textContent = 'Active Citizen 🗳️';
  };
});
