/**
 * AI Assistant UI Components and Message Parsing
 */

/**
 * Parses markdown-lite and returns HTML
 * @param {string} text 
 * @returns {string} HTML
 */
export const parseMarkdown = (text) => {
  return text
    .replace(/^### (.*?)$/gm, '<h3 style="color: var(--chakra); font-size: 1.1rem; margin: 1.2rem 0 0.6rem 0; border-bottom: 2px solid var(--saffron); padding-bottom: 0.2rem; display: block; font-family: \'Outfit\';">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 style="color: var(--chakra); font-size: 1.25rem; margin: 1.5rem 0 0.75rem 0; font-family: \'Outfit\';">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--chakra); font-weight: 800;">$1</strong>')
    .replace(/• (.*?)\n/g, '<div style="margin-bottom: 0.4rem; padding-left: 1rem; border-left: 2px solid var(--saffron);">$1</div>');
};

/**
 * Creates a message bubble element
 * @param {string} text 
 * @param {boolean} isUser 
 * @returns {HTMLElement}
 */
export const createMessageBubble = (text, isUser = false) => {
  const msg = document.createElement('div');
  msg.className = 'assistant-bubble-container';
  
  msg.style.cssText = `
    margin-bottom: 1.5rem;
    padding: 1.25rem 1.5rem;
    border-radius: 18px;
    max-width: 90%;
    font-size: 1rem;
    animation: slideIn 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    line-height: 1.7;
    letter-spacing: -0.01em;
    font-family: 'Inter', sans-serif;
    ${isUser 
      ? 'background: var(--chakra); color: white; margin-left: auto; border-bottom-right-radius: 4px; box-shadow: 0 10px 20px rgba(54, 42, 123, 0.15);' 
      : 'background: white; border: 1px solid #f1f5f9; color: #334155; border-bottom-left-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); white-space: pre-wrap;'}
  `;
  
  msg.innerHTML = parseMarkdown(text);
  return msg;
};
