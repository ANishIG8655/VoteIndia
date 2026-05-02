/**
 * Timeline Manager: Handles real-time election milestones
 */
import { addToGoogleCalendar } from './sync.js';

export const initTimeline = (container) => {
  if (!container) return;

  const milestones = [
    { date: new Date('2026-05-04'), event: 'Results: State Assembly Elections (TN, KL, WB, AS, PY)', label: 'May 4, 2026' },
    { date: new Date('2026-05-12'), event: 'Swearing-in: Tamil Nadu State Assembly', label: 'May 12, 2026' },
    { date: new Date('2026-05-20'), event: 'Swearing-in: West Bengal State Assembly', label: 'May 20, 2026' },
    { date: new Date('2026-06-05'), event: 'Cabinet Formation: Puducherry (UT Assembly)', label: 'June 5, 2026' }
  ];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const render = () => {
    container.innerHTML = milestones.map(m => {
      const isPast = m.date < today;
      const isToday = m.date.getTime() === today.getTime();
      const statusText = isPast ? 'Completed ✅' : (isToday ? 'Live Today 🔴' : 'Upcoming');
      
      return `
        <div class="milestone-v2" style="padding-left: 1rem; border-left: 2px solid ${isPast ? 'var(--green)' : '#e2e8f0'}; margin-bottom: 1.5rem; opacity: ${isPast ? 0.6 : 1}">
          <div style="font-size: 0.7rem; font-weight: 800; color: var(--saffron);">${m.label}</div>
          <div style="font-weight: 600; color: var(--chakra);">${m.event}</div>
          <div style="font-size: 0.75rem; font-weight: 700; color: ${isToday ? '#ef4444' : 'var(--text-light)'}">${statusText}</div>
          ${!isPast ? `<button class="btn-tiny" onclick="window.addToCal('${m.event}', '${m.label}')" style="margin-top: 0.6rem; padding: 8px 12px; font-size: 0.75rem; border: 1px solid #e2e8f0; background: white; cursor: pointer; border-radius: 6px; font-weight: 600; color: var(--chakra);">🗓️ Remind Me</button>` : ''}
        </div>
      `;
    }).join('');
  };

  window.addToCal = addToGoogleCalendar;
  render();
};
