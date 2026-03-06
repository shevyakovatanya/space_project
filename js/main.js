
function scoreToLabel(score) {
  if (score === null || score === undefined) return 'No result yet';
  const s = Number(score);
  if (Number.isNaN(s)) return 'No result yet';

  if (s <= 0) return `😔 (0/5)`;

  let stars = '';
  for (let i = 0; i < s; i++) stars += '⭐️';
  return `${stars} (${s}/5)`;
}

function initTooltips(tooltipEl) {
  if (!tooltipEl) return;
  const planets = document.querySelectorAll('.planet');

  planets.forEach(planet => {
    planet.addEventListener('mouseenter', () => {
      tooltipEl.innerHTML = `<strong>${planet.dataset.name}</strong><br>${planet.dataset.description}`;
      tooltipEl.style.display = 'block';
    });

    planet.addEventListener('mousemove', e => {
      const tooltipWidth = tooltipEl.offsetWidth;
      const viewportWidth = window.innerWidth;
      let left = e.pageX + 15;
      let top = e.pageY + 15;

      if (left + tooltipWidth + 5 > viewportWidth) {
        left = e.pageX - tooltipWidth - 15;
      }

      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
    });

    planet.addEventListener('mouseleave', () => {
      tooltipEl.style.display = 'none';
    });
  });
}

function clearPlanetResults() {
  document.querySelectorAll('.planet-score').forEach(div => {
    div.textContent = 'No result yet';
  });
}

function loadPlanetResults() {
  fetch('api/get_all_results.php', { credentials: 'include' })
    .then(res => res.json())
    .then(results => {
      if (!results || typeof results !== 'object') return;

      document.querySelectorAll('.planet').forEach(planetEl => {
        const link = planetEl.querySelector('a');
        const scoreDiv = planetEl.querySelector('.planet-score');
        if (!link || !scoreDiv) return;

        const url = new URL(link.href);
        let planetName = url.searchParams.get('name');
        if (!planetName) return;
        planetName = planetName.toLowerCase();

        const score = results[planetName];
        scoreDiv.textContent = scoreToLabel(score);
      });
    })
    .catch(err => {
      console.error('Error loading planet results:', err);
    });
}

function updateMyClassButton() {
  const myClassBtn = document.getElementById('myClassBtn');
  if (!myClassBtn) return;

  fetch('api/me.php', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      const role = data && data.user ? data.user.role : null;
      if (role === 'teacher') myClassBtn.classList.remove('hidden');
      else myClassBtn.classList.add('hidden');
    })
    .catch(() => {
      myClassBtn.classList.add('hidden');
    });
}

export function initIndexPage() {
  const tooltip = document.getElementById('tooltip');
  initTooltips(tooltip);

  clearPlanetResults();
  loadPlanetResults();
  updateMyClassButton();

  const myClassBtn = document.getElementById('myClassBtn');
  if (myClassBtn) {
    myClassBtn.addEventListener('click', () => {
      window.location.href = 'classroom.html';
    });
  }

  document.addEventListener('userLoggedIn', () => {
    clearPlanetResults();
    loadPlanetResults();
    updateMyClassButton();
  });

  document.addEventListener('userLoggedOut', () => {
    clearPlanetResults();
    updateMyClassButton();
  });
}
