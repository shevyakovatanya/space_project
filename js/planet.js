import { initQuiz } from './testik.js';

async function fetchMe() {
  try {
    const res = await fetch('api/me.php', { credentials: 'include' });
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

function scoreToText(score) {
  if (score === null || score === undefined) return 'No test result yet';
  const s = Number(score);
  if (Number.isNaN(s)) return 'No test result yet';

  if (s <= 0) return `Your result: 😔 (0/5)`;
  return `Your result: ${'⭐️'.repeat(s)} (${s}/5)`;
}

export async function initPlanetPage() {
  const params = new URLSearchParams(window.location.search);
  const planetName = params.get('name')?.toLowerCase();

  const titleEl = document.getElementById('planetTitle');
  const descEl = document.getElementById('planetDescription');
  const imgEl = document.getElementById('planetImage');
  const starsDiv = document.getElementById('resultStars');
  const startBtn = document.getElementById('startTestBtn');

  const overlay = document.getElementById('quizOverlay');
  const modal = document.querySelector('.quiz-modal');
  const container = document.getElementById('questionContainer');
  const feedback = document.getElementById('feedback');
  const nextBtn = document.getElementById('nextBtn');
  const closeBtn = document.getElementById('close-quiz');

  const user = await fetchMe();
  window.__currentUser = user;

  if (!planetName) {
    if (titleEl) titleEl.textContent = 'No planet selected';
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = 'Quiz unavailable';
    }
    return;
  }

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = 'Loading quiz…';
    startBtn.dataset.planet = planetName;
  }

  try {
    const res = await fetch(`api/planet.php?name=${encodeURIComponent(planetName)}`);
    const data = await res.json();

    if (data.error) {
      if (titleEl) titleEl.textContent = data.error;
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Quiz unavailable';
      }
      return;
    }

    document.title = data.name;
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = data.name;
    if (titleEl) titleEl.textContent = data.name;

    if (imgEl) {
      imgEl.src = data.image || '';
      imgEl.alt = data.name;
    }
    if (descEl) descEl.textContent = data.description || '';

    if (data.background) {
      document.body.style.backgroundImage = `url('${data.background}')`;
    }

    try {
      const rRes = await fetch(`api/get_result.php?planet=${encodeURIComponent(planetName)}`, { credentials: 'include' });
      const rData = await rRes.json();
      if (starsDiv) starsDiv.textContent = scoreToText(rData.score);
    } catch (err) {
      console.error('Result load error:', err);
    }

    if (!user && starsDiv) {
      starsDiv.textContent = (starsDiv.textContent ? starsDiv.textContent + ' • ' : '') + 'Log in on the main page to save your result.';
    }

    if (!data.questions) {
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Quiz unavailable';
      }
      return;
    }

    const qRes = await fetch(data.questions);
    const questions = await qRes.json();
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Questions JSON is empty');
    }

    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Start quiz';
    }

    initQuiz({
      startBtn,
      overlay,
      modal,
      container,
      feedback,
      nextBtn,
      starsDiv,
      closeBtn,
      questions,
      planet: planetName,
      user
    });
  } catch (err) {
    console.error('Planet load error:', err);
    if (titleEl) titleEl.textContent = 'Error loading planet';
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = 'Quiz unavailable';
    }
  }
}
