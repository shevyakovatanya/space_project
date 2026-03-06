import { initAuth } from './auth.js';
import { initIndexPage } from './main.js';
import { initPlanetPage } from './planet.js';
import { initClassroomPage } from './classroom.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();

  if (document.body.classList.contains('page--index')) {
    initIndexPage();
  }

  if (document.body.classList.contains('page--planet')) {
    initPlanetPage();
  }

  if (document.body.classList.contains('page--classroom')) {
    initClassroomPage();
  }
});
