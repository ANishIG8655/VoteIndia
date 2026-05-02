/**
 * News Service: Handles fetching and rendering of election news
 */
import { Analytics } from './AnalyticsService.js';

export const initNews = (container) => {
  if (!container) return;

  const newsData = [
    { title: "ECI Announces Tight Security for May 4 Counting Day", source: "PTI News", time: "2h ago", tag: "Security" },
    { title: "Exit Polls Hint at Multi-Cornered Contests in WB and TN", source: "Election Desk", time: "5h ago", tag: "Analysis" },
    { title: "VVPAT Verification Process Explained for New Voters", source: "VoteWise Digital", time: "1d ago", tag: "Education" }
  ];

  const render = () => {
    container.innerHTML = newsData.map(item => `
      <div class="news-item" style="padding: 1.25rem; border-bottom: 1px solid #f1f5f9; cursor: pointer;" onmouseover="this.style.background='#fcfdfe'" onmouseout="this.style.background='transparent'">
        <div style="display: flex; gap: 10px; margin-bottom: 0.5rem; align-items: center;">
          <span style="background: #eef2ff; color: #4f46e5; font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${item.tag}</span>
          <span style="font-size: 0.7rem; color: var(--text-light);">${item.source} • ${item.time}</span>
        </div>
        <h4 class="news-title" data-title="${item.title}" style="font-size: 0.95rem; color: var(--chakra); line-height: 1.4; font-weight: 600; margin: 0;">${item.title}</h4>
      </div>
    `).join('') + `
      <div style="padding: 1rem; text-align: center;">
        <button style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: var(--chakra); font-size: 0.8rem; font-weight: 600; cursor: pointer;">View All News</button>
      </div>
    `;
  };

  container.addEventListener('click', (e) => {
    const newsTitle = e.target.closest('.news-title');
    if (newsTitle) {
      Analytics.trackNewsClick(newsTitle.dataset.title);
    }
  });

  render();
};
