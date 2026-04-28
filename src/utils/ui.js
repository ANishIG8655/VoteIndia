/**
 * UI Utils: Helper functions for UI rendering and interactions
 */

export const parseMarkdown = (text) => {
  return text
    .replace(/^### (.*?)$/gm, '<h3 style="color: var(--chakra); font-size: 1.1rem; margin: 1.2rem 0 0.6rem 0; border-bottom: 2px solid var(--saffron); padding-bottom: 0.2rem; display: block; font-family: \'Outfit\';">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 style="color: var(--chakra); font-size: 1.25rem; margin: 1.5rem 0 0.75rem 0; font-family: \'Outfit\';">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--chakra); font-weight: 800;">$1</strong>')
    .replace(/• (.*?)\n/g, '<div style="margin-bottom: 0.4rem; padding-left: 1rem; border-left: 2px solid var(--saffron);">$1</div>');
};

export const showToast = (message, isError = false) => {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${isError ? '#ef4444' : 'var(--chakra)'};
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 2000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
