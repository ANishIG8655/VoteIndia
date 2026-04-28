/**
 * Ticker Component: Handles the animated regional trends list
 */

export const createTrendNode = (trend, isPaused) => {
  const btn = document.createElement('button');
  btn.className = 'trend-ticker-item';
  btn.setAttribute('aria-label', `Read insight: ${trend.title}`);
  btn.style.cssText = `
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
    will-change: transform, box-shadow;
    text-align: left;
    font-family: inherit;
  `;
  btn.innerHTML = `
    <div style="font-weight: 700; color: var(--chakra); font-size: 0.95rem; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
        <span class="live-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0;"></span>
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${trend.title}</span>
      </div>
    </div>
    <div style="font-size: 0.825rem; color: var(--text-light); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${trend.insight}</div>
  `;
  return btn;
};
