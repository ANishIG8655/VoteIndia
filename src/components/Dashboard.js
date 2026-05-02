/**
 * Dashboard Module: Orchestrates top-level dashboard features and sub-services.
 */
import { startLiveClock } from '../services/sync.js';
import { initKYCSearch } from '../services/KYCService.js';
import { initNews } from '../services/NewsService.js';
import { initTimeline } from '../services/TimelineManager.js';

export const initDashboard = () => {
  // Init Sub-Services
  initHeroEffects();
  initKYCSearch();
  initNews(document.getElementById('news-container'));
  initTimeline(document.getElementById('election-timeline'));
  
  // Init Local Features
  animateCounters();
  initScrollReveal();
  startLiveClock('live-clock');
};

function initHeroEffects() {
  const hero = document.getElementById('dynamic-hero');
  const locationTag = document.getElementById('hero-location-badge');
  const backgrounds = [
    { src: '/loc_varanasi.png', name: 'Varanasi, Uttar Pradesh' },
    { src: '/loc_hampi.png', name: 'Hampi, Karnataka' }
  ];
  let currentIdx = 0;
  
  const updateHero = (index) => {
    if (!hero) return;
    hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${backgrounds[index].src}')`;
    if (locationTag) {
      locationTag.innerHTML = `📍 ${backgrounds[index].name}`;
      locationTag.style.opacity = '0';
      setTimeout(() => { locationTag.style.opacity = '1'; }, 100);
    }
  };

  updateHero(0);
  setInterval(() => {
    currentIdx = (currentIdx + 1) % backgrounds.length;
    updateHero(currentIdx);
  }, 8000);
}

function animateCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const updateCount = () => {
      const current = +counter.innerText;
      const increment = target / 50;
      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCount, 20);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
}
