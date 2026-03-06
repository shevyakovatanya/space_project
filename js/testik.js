
function renderStars(score, max = 5) {
  const s = Number(score);
  if (!Number.isFinite(s) || s <= 0) return `😔 (0/${max})`;
  return `${'⭐️'.repeat(s)} (${s}/${max})`;
}

export function initQuiz({
  startBtn,
  overlay,
  modal,
  container,
  feedback,
  nextBtn,
  starsDiv,
  closeBtn,
  questions,
  planet,
  user
}) {
  if (!startBtn || !overlay || !modal || !container || !feedback || !nextBtn) return;
  if (!Array.isArray(questions) || questions.length === 0) return;
  if (!planet) return;

  let current = 0;
  let score = 0;
  let answered = false;

  const openQuiz = () => {
    overlay.classList.remove('hidden');
    current = 0;
    score = 0;
    showQuestion();
  };

  const closeQuiz = () => {
    overlay.classList.add('hidden');
  };

  const showQuestion = () => {
    answered = false;
    feedback.textContent = '';
    feedback.className = 'feedback';
    nextBtn.classList.add('hidden');

    const q = questions[current];
    container.innerHTML = `
      <p><strong>Question ${current + 1}/${questions.length}:</strong> ${q.text}</p>
      <div class="options-container">
        ${q.options
          .map(
            (opt, i) => `
          <label class="option">
            <input type="radio" name="answer" value="${i}">
            <span class="option-text">${opt}</span>
          </label>`
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll('input[name="answer"]').forEach(input => {
      input.addEventListener('change', checkAnswer);
    });
  };

  const checkAnswer = e => {
    if (answered) return;
    answered = true;

    const userAnswer = Number(e.target.value);
    const correct = Number(questions[current].correct);

    if (userAnswer === correct) {
      feedback.textContent = '✅ Correct!';
      feedback.className = 'feedback correct';
      score++;
    } else {
      feedback.textContent = `❌ Incorrect. Correct answer: ${questions[current].options[correct]}`;
      feedback.className = 'feedback wrong';
    }

    nextBtn.classList.remove('hidden');
  };

  const endQuiz = () => {
    container.innerHTML = `<h3>Your score is ${score}/${questions.length}</h3>`;
    feedback.textContent = '';
    feedback.className = 'feedback';
    nextBtn.classList.add('hidden');

    if (starsDiv) {
      starsDiv.textContent = `Your result: ${renderStars(score, 5)}`;
      if (!user) {
        starsDiv.textContent += ' • Log in on the main page to save your result.';
      }
    }

    if (!user) return;

    fetch('api/save_result.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planet, score })
    })
      .then(async r => {
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(txt || 'Save result failed');
        }
        return r.json();
      })
      .then(ans => {
        console.log('Save result:', ans);
      })
      .catch(err => {
        console.error('Save result error:', err);
      });
  };

  startBtn.addEventListener('click', openQuiz);

  nextBtn.addEventListener('click', () => {
    current++;
    if (current < questions.length) showQuestion();
    else endQuiz();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeQuiz();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeQuiz();
  });
}
