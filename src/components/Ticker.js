/**
 * Trend Ticker Component & Animation Logic
 */

import { indiaElections } from '../electionData.js';

/**
 * Creates a single ticker item node
 */
export const createTrendNode = (t, isPaused) => {
  const div = document.createElement('button');
  div.className = 'trend-ticker-item';
  div.setAttribute('aria-label', `Read insight: ${t.title}`);
  div.style.cssText = `
    margin-bottom: 1rem; 
    border: none; 
    border-left: 4px solid ${isPaused ? 'var(--chakra)' : 'var(--saffron)'}; 
    border-radius: 16px; 
    background: white; 
    padding: 1.25rem; 
    width: 100%; 
    box-sizing: border-box; 
    height: 100px; 
    cursor: pointer; 
    box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); 
    position: relative; 
    z-index: 1;
    text-align: left;
    font-family: inherit;
  `;
  div.innerHTML = `
    <div style="font-weight: 700; color: var(--chakra); font-size: 0.95rem; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
        <span class="live-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0;"></span>
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</span>
      </div>
      <span class="zoom-hint" style="font-size: 0.7rem; opacity: 0.4; font-weight: 400;">Click to Zoom</span>
    </div>
    <div style="font-size: 0.825rem; color: var(--text-light); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.insight}</div>
  `;

  div.onclick = (e) => {
    e.stopPropagation();
    const isZoomed = div.classList.contains('zoomed');
    
    // Clear other zoomed items
    document.querySelectorAll('.trend-ticker-item.zoomed').forEach(el => el.classList.remove('zoomed'));
    
    if (!isZoomed) {
      div.classList.add('zoomed');
      div.dispatchEvent(new CustomEvent('pauseTicker', { bubbles: true, detail: { pause: true } }));
    } else {
      div.dispatchEvent(new CustomEvent('pauseTicker', { bubbles: true, detail: { pause: false } }));
    }
  };

  return div;
};

/**
 * Initializes the Ticker with Animation Loop
 */
export const initTicker = (container) => {
  if (!container) return;
  
  let isPaused = false;
  let topIndex = 0;
  const itemHeight = 116;

  // Initial render
  for(let i = 0; i < 3; i++) {
    container.appendChild(createTrendNode(indiaElections.trends[i], isPaused));
  }

  const shiftTicker = () => {
    if (isPaused || document.getElementById('app-screen').style.display !== 'block') return;

    const items = container.querySelectorAll('.trend-ticker-item');
    if (items.length < 3) return;

    const lastItem = items[2];
    lastItem.style.opacity = '0';
    lastItem.style.transform = 'translateY(30px) scale(0.95)';

    for(let i = 0; i < 2; i++) {
      items[i].style.transform = `translateY(${itemHeight}px)`;
    }

    setTimeout(() => {
      lastItem.remove();
      topIndex = (topIndex - 1 + indiaElections.trends.length) % indiaElections.trends.length;
      const newItem = createTrendNode(indiaElections.trends[topIndex], isPaused);
      
      const remainingItems = container.querySelectorAll('.trend-ticker-item');
      remainingItems.forEach(el => {
        el.style.transition = 'none';
        el.style.transform = 'translateY(0)';
      });

      newItem.style.opacity = '0';
      newItem.style.transform = `translateY(-${itemHeight}px) scale(0.95)`;
      container.prepend(newItem);

      void newItem.offsetWidth; // Reflow

      newItem.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      newItem.style.opacity = '1';
      newItem.style.transform = 'translateY(0) scale(1)';
    }, 600);
  };

  const tickerInterval = setInterval(shiftTicker, 3500);

  // Expose pause/resume
  container.addEventListener('mouseenter', () => { isPaused = true; });
  container.addEventListener('mouseleave', () => { 
    if (!container.querySelector('.zoomed')) isPaused = false; 
  });

  container.addEventListener('pauseTicker', (e) => {
    isPaused = e.detail.pause;
  });
  
  return tickerInterval;
};
