/**
 * Voter Awareness Quiz Component
 */

import { kycDatabase } from '../electionData.js';
import { showToast } from '../utils/ui.js';

export const initQuiz = () => {
  const quizScreen = document.getElementById('quiz-screen');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizResultScreen = document.getElementById('quiz-result-screen');
  const quizScoreText = document.getElementById('quiz-score-text');
  const restartQuizBtn = document.getElementById('restart-quiz');

  let currentQuestionIndex = 0;
  let score = 0;

  const loadQuestion = () => {
    const q = kycDatabase[currentQuestionIndex];
    if (!q || !quizQuestion || !quizOptions) return;

    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.width = '100%';
      btn.style.marginBottom = '0.5rem';
      btn.style.textAlign = 'left';
      btn.style.background = 'white';
      btn.style.color = 'var(--chakra)';
      btn.style.border = '1px solid #e2e8f0';
      btn.textContent = opt;
      btn.onclick = () => checkAnswer(idx);
      quizOptions.appendChild(btn);
    });
  };

  const checkAnswer = (idx) => {
    const q = kycDatabase[currentQuestionIndex];
    if (idx === q.correct) {
      score++;
      showToast("Correct Answer!", false);
    } else {
      showToast(`Incorrect! The right answer was: ${q.options[q.correct]}`, true);
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < kycDatabase.length) {
      loadQuestion();
    } else {
      showQuizResult();
    }
  };

  const showQuizResult = () => {
    if (!quizScreen || !quizResultScreen || !quizScoreText) return;
    quizScreen.style.display = 'none';
    quizResultScreen.style.display = 'block';
    quizScoreText.textContent = `You scored ${score} out of ${kycDatabase.length}!`;
  };

  if (restartQuizBtn) {
    restartQuizBtn.onclick = () => {
      score = 0;
      currentQuestionIndex = 0;
      quizResultScreen.style.display = 'none';
      loadQuestion();
    };
  }

  loadQuestion();
};
