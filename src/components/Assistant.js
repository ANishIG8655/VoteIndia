import { parseMarkdown } from '../utils/ui.js';

/**
 * Assistant Component: Renders chat bubbles and quick-reply options
 */

export const createMessageBubble = (text, isUser) => {
  const msg = document.createElement('div');
  msg.className = 'chat-bubble';
  msg.style.cssText = `
    margin-bottom: 1.5rem;
    padding: 1.25rem 1.5rem;
    border-radius: 18px;
    max-width: 90%;
    font-size: 1rem;
    animation: slideIn 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    line-height: 1.7;
    font-family: 'Inter', sans-serif;
    ${isUser 
      ? 'background: var(--chakra); color: white; margin-left: auto; border-bottom-right-radius: 4px;' 
      : 'background: white; border: 1px solid #f1f5f9; color: #334155; border-bottom-left-radius: 4px;'}
  `;
  msg.innerHTML = parseMarkdown(text);
  return msg;
};

export const createOptionButton = (opt, index, onClick) => {
  const btn = document.createElement('button');
  btn.className = 'option-btn';
  btn.textContent = opt.label || opt;
  btn.style.cssText = `
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    margin-right: 0.6rem;
    background: rgba(241, 245, 249, 0.7);
    color: var(--chakra);
    border: 1px solid rgba(54, 42, 123, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: optionFadeIn 0.4s ease forwards;
    animation-delay: ${index * 0.1}s;
    opacity: 0;
  `;
  btn.onclick = onClick;
  return btn;
};
