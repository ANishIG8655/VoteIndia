import { addMessage, showOptions } from '../components/Assistant.js';
import { modes } from '../electionData.js';
import { switchLanguage } from './language.js';
import { showToast } from '../utils/ui.js';

/**
 * UI Manager: Orchestrates non-page-specific UI interactions (Assistant, Language)
 */
export const initGlobalUI = () => {
  // Assistant
  const toggleBtn = document.getElementById('assistant-toggle');
  const panel = document.getElementById('assistant-panel');
  const closeBtn = document.getElementById('close-assistant');

  toggleBtn?.addEventListener('click', () => {
    const isVisible = panel.style.display === 'flex';
    panel.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible && document.getElementById('assistant-messages').children.length === 0) {
      addMessage("Namaste! I am your VoteWise Assistant.");
      showOptions(modes);
    }

    if (window.gtag) {
      window.gtag('event', 'assistant_toggle', { status: !isVisible ? 'open' : 'closed' });
    }
  });

  closeBtn?.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  // Language
  document.getElementById('custom-language-trigger')?.addEventListener('click', () => {
    document.getElementById('language-modal').style.display = 'flex';
  });

  document.getElementById('close-lang-modal')?.addEventListener('click', () => {
    document.getElementById('language-modal').style.display = 'none';
  });

  document.getElementById('reset-lang')?.addEventListener('click', () => {
    switchLanguage('', 'English', showToast);
  });
};
