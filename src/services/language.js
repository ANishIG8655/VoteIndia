/**
 * Google Translate Service & Custom Language Picker Logic
 */

export const languages = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' }
];

/**
 * Triggers the hidden Google Translate engine
 * @param {string} code - ISO Language Code
 * @param {string} name - Human readable name
 * @param {Function} showToast - Callback for notifications
 */
export const switchLanguage = (code, name, showToast) => {
  const langModal = document.getElementById('language-modal');
  if (langModal) langModal.style.display = 'none';

  if (showToast) {
    showToast(code ? `Translating to ${name}...` : 'Resetting to English...', false);
  }

  let attempts = 0;
  const forceSwitch = () => {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (attempts < 20) {
      attempts++;
      setTimeout(forceSwitch, 250);
    }
  };
  forceSwitch();
};

/**
 * Initializes the custom language selection grid
 */
export const initLanguagePicker = (gridElement, showToast) => {
  if (!gridElement) return;
  gridElement.innerHTML = '';
  
  languages.forEach(lang => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      padding: 1.5rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    `;
    btn.innerHTML = `
      <div style="font-weight: 800; color: var(--chakra); font-size: 1.2rem; pointer-events: none;">${lang.native}</div>
      <div style="font-size: 0.85rem; color: var(--text-light); font-weight: 600; pointer-events: none;">${lang.name}</div>
    `;
    
    btn.onmouseenter = () => {
      btn.style.borderColor = 'var(--saffron)';
      btn.style.transform = 'translateY(-4px)';
      btn.style.background = '#ffffff';
      btn.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
    };
    btn.onmouseleave = () => {
      btn.style.borderColor = '#e2e8f0';
      btn.style.transform = 'translateY(0)';
      btn.style.background = '#f8fafc';
      btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)';
    };
    btn.onmousedown = () => btn.style.transform = 'scale(0.94)';
    btn.onmouseup = () => btn.style.transform = 'translateY(-4px)';
    
    btn.onclick = () => switchLanguage(lang.code, lang.name, showToast);
    gridElement.appendChild(btn);
  });
};

/**
 * Nudges Google Translate to re-scan dynamic content
 */
export const nudgeTranslator = () => {
  const combo = document.querySelector('.goog-te-combo');
  if (combo && combo.value) {
    setTimeout(() => {
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    }, 400);
  }
};
