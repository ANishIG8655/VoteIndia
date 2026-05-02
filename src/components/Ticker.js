/**
 * Ticker Module: Manages the 'Regional Trends' waterfall animation and data rendering.
 * Optimized for Code Quality, Security, and Animation Performance.
 */
import { indiaElections } from '../electionData.js';
import { sanitizeHTML } from '../utils/sanitizer.js';

/**
 * Creates a single ticker item node using sanitized data and CSS classes.
 * @param {Object} trend - The trend data object (title, insight).
 * @param {boolean} isPaused - Current pause state of the ticker.
 * @returns {HTMLButtonElement} The constructed ticker item.
 */
export const createTrendNode = (trend, isPaused) => {
  const btn = document.createElement('button');
  btn.className = `trend-ticker-item ${isPaused ? 'paused' : ''}`;
  btn.setAttribute('aria-label', `Election Trend: ${trend.title}`);
  
  try {
    const sTitle = sanitizeHTML(trend.title);
    const sInsight = sanitizeHTML(trend.insight);

    btn.innerHTML = `
      <div class="trend-item-header">
        <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
          <span class="live-dot" aria-hidden="true"></span>
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sTitle}</span>
        </div>
      </div>
      <div class="trend-item-body">${sInsight}</div>
    `;

    btn.onclick = (e) => {
      e.stopPropagation();
      const isZoomed = btn.classList.contains('zoomed');
      
      // Clean up previous zooms
      document.querySelectorAll('.trend-ticker-item.zoomed').forEach(el => el.classList.remove('zoomed'));
      
      if (!isZoomed) {
        btn.classList.add('zoomed');
        btn.dispatchEvent(new CustomEvent('pauseTicker', { bubbles: true, detail: { pause: true } }));
      } else {
        btn.dispatchEvent(new CustomEvent('pauseTicker', { bubbles: true, detail: { pause: false } }));
      }
    };
  } catch (err) {
    console.error("Failed to create trend node:", err);
    btn.textContent = "Data Error";
  }

  return btn;
};

/**
 * Initializes the Ticker animation loop with a waterfall effect.
 * @param {HTMLElement} container - The container element to inject nodes into.
 * @returns {number|null} The interval ID or null if initialization failed.
 */
export const initTicker = (container) => {
  if (!container) return null;
  
  try {
    let isPaused = false;
    let topIndex = 0;
    const itemHeight = 130; // Further increased for premium spacing
    const trends = indiaElections.trends || [];

    if (trends.length === 0) return null;

    // Initial render of the first 3 items
    for(let i = 0; i < Math.min(3, trends.length); i++) {
      container.appendChild(createTrendNode(trends[i], isPaused));
    }

    /**
     * Executes the waterfall shift animation
     */
    const shiftTicker = () => {
      const appVisible = document.getElementById('app-screen')?.style.display === 'block';
      if (isPaused || !appVisible) return;

      const items = container.querySelectorAll('.trend-ticker-item');
      if (items.length < 2) return;

      const lastItem = items[items.length - 1];
      lastItem.style.opacity = '0';
      lastItem.style.transform = 'translateY(30px) scale(0.95)';

      // Shift existing items down
      for(let i = 0; i < items.length - 1; i++) {
        items[i].style.transform = `translateY(${itemHeight}px)`;
      }

      setTimeout(() => {
        lastItem.remove();
        topIndex = (topIndex - 1 + trends.length) % trends.length;
        const newItem = createTrendNode(trends[topIndex], isPaused);
        
        container.querySelectorAll('.trend-ticker-item').forEach(el => {
          el.style.transition = 'none';
          el.style.transform = 'translateY(0)';
        });

        newItem.style.opacity = '0';
        newItem.style.transform = `translateY(-${itemHeight}px) scale(0.95)`;
        container.prepend(newItem);

        void newItem.offsetWidth; // Force Reflow

        newItem.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0) scale(1)';
      }, 600);
    };

    const tickerInterval = setInterval(shiftTicker, 3500);

    // Event Delegation for pause/resume
    container.addEventListener('mouseenter', () => { isPaused = true; });
    container.addEventListener('mouseleave', () => { 
      if (!container.querySelector('.zoomed')) isPaused = false; 
    });

    container.addEventListener('pauseTicker', (e) => {
      isPaused = e.detail.pause;
    });
    
    return tickerInterval;
  } catch (err) {
    console.error("Ticker initialization failed:", err);
    return null;
  }
};
