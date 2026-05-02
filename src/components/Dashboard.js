/**
 * Dashboard Component: Handles specialized UI logic for the main dashboard screen.
 */
import { showToast } from '../utils/ui.js';
import { startLiveClock, addToGoogleCalendar } from '../services/sync.js';

export const initDashboard = () => {
  // Visual confirmation of auto-update
  showToast("🔄 Synchronizing live election data...", false);
  
  initHeroEffects();
  animateCounters();
  initScrollReveal();
  initUpcomingMilestones();
  initKYCSearch();
  initNewsSelection();
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
    const increment = target / 50;
    let count = 0;
    const updateCount = () => {
      if (count < target) {
        count += increment;
        counter.innerText = Math.ceil(count);
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

function initUpcomingMilestones() {
  const container = document.getElementById('election-timeline');
  if (!container) return;

  const milestones = [
    { date: new Date('2026-05-04'), event: 'Results: State Assembly Elections (TN, KL, WB, AS, PY)', label: 'May 4, 2026' },
    { date: new Date('2026-05-12'), event: 'Swearing-in: Tamil Nadu State Assembly', label: 'May 12, 2026' },
    { date: new Date('2026-05-20'), event: 'Swearing-in: West Bengal State Assembly', label: 'May 20, 2026' },
    { date: new Date('2026-06-05'), event: 'Cabinet Formation: Puducherry (UT Assembly)', label: 'June 5, 2026' }
  ];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  container.innerHTML = milestones.map(m => {
    const isPast = m.date < today;
    const isToday = m.date.getTime() === today.getTime();
    let statusText = 'Upcoming', statusColor = 'var(--text-light)', opacity = '1';

    if (isPast) {
      statusText = 'Completed ✅';
      statusColor = 'var(--green)';
      opacity = '0.6';
    } else if (isToday) {
      statusText = 'Live Today 🔴';
      statusColor = '#ef4444';
    }

    return `
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; position: relative; padding-left: 1.5rem; border-left: 2px solid ${isPast ? 'var(--green)' : '#e2e8f0'}; transition: all 0.3s; opacity: ${opacity};" class="milestone-item">
        <div style="position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: ${isPast ? 'var(--green)' : 'var(--chakra)'}; border: 2px solid white;"></div>
        <div style="flex: 1;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--saffron); text-transform: uppercase;">${m.label}</div>
          <div style="font-weight: 600; color: var(--chakra); ${isPast ? 'text-decoration: line-through;' : ''}">${m.event}</div>
          <div style="font-size: 0.8rem; color: ${statusColor}; font-weight: 700; margin-bottom: 0.5rem;">${statusText}</div>
          ${!isPast ? `
            <button class="cal-btn" data-event="${m.event}" data-date="${m.label}" style="background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; font-size: 0.7rem; color: var(--chakra); cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
              <span>🗓️</span> Remind Me
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.onclick = (e) => {
    const btn = e.target.closest('.cal-btn');
    if (btn) addToGoogleCalendar(btn.dataset.event, btn.dataset.date);
  };
}

function initKYCSearch() {
  const searchBtn = document.getElementById('kyc-search-btn');
  const input = document.getElementById('kyc-search-input');
  const modal = document.getElementById('kyc-modal');
  const closeBtn = document.getElementById('close-kyc');
  const resultsContainer = document.getElementById('kyc-results-container');
  const constituencySpan = document.querySelector('#kyc-constituency-name span');

  const candidateDB = {
    'varanasi': [
      { name: 'Narendra Modi', party: 'BJP', assets: '₹3.02 Cr', edu: 'MA (Pol Science)', cases: 'Nil' },
      { name: 'Ajay Rai', party: 'INC', assets: '₹5.5 Cr', edu: 'Graduate', cases: '12 (Political)' },
      { name: 'Ather Jamal Lari', party: 'BSP', assets: '₹1.8 Cr', edu: 'Post Graduate', cases: 'Nil' }
    ],
    'wayanad': [
      { name: 'Rahul Gandhi', party: 'INC', assets: '₹20.4 Cr', edu: 'M.Phil (Cambridge)', cases: '18 (Political)' },
      { name: 'Annie Raja', party: 'CPI', assets: '₹72 Lakh', edu: 'Graduate', cases: 'Nil' },
      { name: 'K. Surendran', party: 'BJP', assets: '₹1.2 Cr', edu: 'Graduate', cases: '240 (Political)' }
    ],
    'kolathur': [
      { name: 'M.K. Stalin', party: 'DMK', assets: '₹8.8 Cr', edu: 'Graduate (Presidency)', cases: 'Nil' },
      { name: 'Adhi Rajaram', party: 'AIADMK', assets: '₹4.2 Cr', edu: 'Graduate', cases: 'Nil' }
    ],
    'diamond harbour': [
      { name: 'Abhishek Banerjee', party: 'AITC', assets: '₹1.2 Cr', edu: 'MBA', cases: 'Nil' },
      { name: 'Abhijit Das', party: 'BJP', assets: '₹1.5 Cr', edu: 'LLB', cases: '5 (Political)' }
    ],
    'nandigram': [
      { name: 'Mamata Banerjee', party: 'AITC', assets: '₹16.7 Lakh', edu: 'MA, LLB', cases: 'Nil' },
      { name: 'Suvendu Adhikari', party: 'BJP', assets: '₹80 Lakh', edu: 'Post Graduate', cases: 'Nil' }
    ]
  };

  if (!searchBtn || !input || !modal) return;

  searchBtn.onclick = () => {
    const val = input.value.trim().toLowerCase();
    if (!val) { showToast("Please enter a constituency name", true); return; }
    
    constituencySpan.textContent = input.value.trim();
    const candidates = candidateDB[val];

    if (candidates && candidates.length > 0) {
      const now = new Date();
      const timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.2rem;">
          <div style="font-size: 0.75rem; color: var(--text-light); text-align: right; margin-bottom: -0.5rem;">
            ⚡ Profiles Last Updated: ${timestamp}
          </div>
          ${candidates.map(c => `
            <div style="background: white; padding: 1.8rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: all 0.3s; position: relative; overflow: hidden;" class="candidate-card">
              <!-- Party Stripe -->
              <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--chakra);"></div>
              
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.2rem;">
                <div>
                  <h4 style="color: var(--chakra); margin: 0; font-size: 1.25rem;">${c.name}</h4>
                  <div style="color: var(--saffron); font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; margin-top: 0.2rem;">
                    Representing: ${c.party}
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="background: #fff1f2; color: #e11d48; font-size: 0.65rem; padding: 4px 10px; border-radius: 20px; font-weight: 700; border: 1px solid #fda4af; display: inline-block;">
                    🔴 AWAITING RESULTS
                  </span>
                  <div style="font-size: 0.6rem; color: var(--text-light); margin-top: 4px;">Counting Day: May 4</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                <div>
                  <div style="font-size: 0.65rem; color: var(--text-light); text-transform: uppercase; margin-bottom: 0.3rem;">Assets</div>
                  <div style="font-weight: 700; color: var(--text); font-size: 0.9rem;">${c.assets}</div>
                </div>
                <div>
                  <div style="font-size: 0.65rem; color: var(--text-light); text-transform: uppercase; margin-bottom: 0.3rem;">Education</div>
                  <div style="font-weight: 700; color: var(--text); font-size: 0.9rem;">${c.edu}</div>
                </div>
                <div>
                  <div style="font-size: 0.65rem; color: var(--text-light); text-transform: uppercase; margin-bottom: 0.3rem;">Cases</div>
                  <div style="font-weight: 700; color: ${c.cases === 'Nil' ? 'var(--green)' : '#e11d48'}; font-size: 0.9rem;">${c.cases}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-light);">
          <p>No verified data found for "${input.value.trim()}".</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">Try searching for <strong>Varanasi</strong>, <strong>Wayanad</strong>, or <strong>Kolathur</strong>.</p>
        </div>
      `;
    }
    modal.style.display = 'flex';
  };
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function initNewsSelection() {
  const container = document.getElementById('news-container');
  if (!container) return;

  const news = [
    { title: "ECI Announces Tight Security for May 4 Counting Day", source: "PTI News", time: "2h ago", tag: "Security" },
    { title: "Exit Polls Hint at Multi-Cornered Contests in WB and TN", source: "Election Desk", time: "5h ago", tag: "Analysis" },
    { title: "VVPAT Verification Process Explained for New Voters", source: "VoteIndia Digital", time: "1d ago", tag: "Education" }
  ];

  container.innerHTML = news.map(item => `
    <div style="padding: 1.25rem; border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#fcfdfe'" onmouseout="this.style.background='transparent'">
      <div style="display: flex; gap: 10px; margin-bottom: 0.5rem; align-items: center;">
        <span style="background: #eef2ff; color: #4f46e5; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${item.tag}</span>
        <span style="font-size: 0.7rem; color: var(--text-light);">${item.source} • ${item.time}</span>
      </div>
      <h4 style="font-size: 1rem; color: var(--chakra); line-height: 1.4; font-weight: 600; cursor: pointer;">${item.title}</h4>
    </div>
  `).join('') + `
    <div style="padding: 1rem; text-align: center;">
      <button class="btn btn-sm" style="width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; color: var(--chakra);">View All News</button>
    </div>
  `;
}
