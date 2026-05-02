/**
 * UI Utilities and Effects
 */

/**
 * Shows a toast notification
 * @param {string} message 
 * @param {boolean} isError 
 */
export const showToast = (message, isError = false) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? '#ef4444' : '#362A7B';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 4000);
};

/**
 * Initializes 3D Parallax hover effects on selected elements
 * @param {string} selector 
 */
export const initParallax = (selector = '.parallax-wrap') => {
  const wraps = document.querySelectorAll(selector);
  wraps.forEach(wrap => {
    const inner = wrap.querySelector('.parallax-inner');
    if (!inner) return;

    wrap.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      inner.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    wrap.addEventListener('mouseleave', () => {
      inner.style.transform = `scale(1) rotateX(0) rotateY(0)`;
      inner.style.transition = `transform 0.5s ease-out`;
    });
    
    wrap.addEventListener('mouseenter', () => {
      inner.style.transition = `transform 0.1s ease-out`;
    });
  });
};
