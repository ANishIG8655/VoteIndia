import './style.css';
import { auth, db } from './services/firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import { modes } from './electionData.js';
import { showToast, initParallax } from './utils/ui.js';
import { initLanguagePicker, switchLanguage } from './services/language.js';
import { handleAuth, getUserProfile } from './services/auth.js';
import { addMessage, showOptions } from './components/Assistant.js';

// Global DB
window.db = db;

// PWA: Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered'))
      .catch(err => console.log('SW Reg Failed', err));
  });
}

// Global Connection Monitoring
window.addEventListener('online', () => showToast("🌐 Connection Restored. Updating live data...", false));
window.addEventListener('offline', () => {
  showToast("📡 Connection Lost. Switching to Offline Mode.", true);
  setTimeout(() => {
    window.location.href = '/offline.html';
  }, 1000);
});

document.addEventListener('DOMContentLoaded', () => {
  const appScreen = document.getElementById('app-screen');
  const authScreen = document.getElementById('auth-screen');
  const splashScreen = document.getElementById('global-splash');
  const splashProgress = document.getElementById('splash-progress');

  if (splashProgress) splashProgress.style.width = '100%';

  const hideSplash = () => {
    if (splashScreen && splashScreen.style.display !== 'none') {
      splashScreen.style.opacity = '0';
      setTimeout(() => { 
        splashScreen.style.display = 'none';
        initPostLoadEffects();
      }, 400);
    }
  };

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (authScreen) authScreen.style.display = 'none';
      if (appScreen) appScreen.style.display = 'block';
      hideSplash();
      getUserProfile(user.uid).then(profile => {
        if (profile) updateDashboardUI(profile);
      });
    } else {
      if (appScreen) appScreen.style.display = 'none';
      if (authScreen) authScreen.style.display = 'flex';
      hideSplash();
    }
  });

  async function initPostLoadEffects() {
    const { initTicker } = await import('./components/Ticker.js');
    const { initQuiz } = await import('./components/Quiz.js');
    const { initDashboard } = await import('./components/Dashboard.js');
    
    initParallax();
    initTicker(document.getElementById('trends-container'));
    initQuiz();
    initLanguagePicker(document.getElementById('language-grid'), showToast);
    initEvmNavigation();
    initExplainerNavigation();
    initDashboard();
  }

  document.addEventListener('click', (e) => {
    handleAssistantToggle(e);
    handleLanguageControls(e);
    handleAuthUI(e);
  });

  function handleAssistantToggle(e) {
    const toggleBtn = document.getElementById('assistant-toggle');
    const panel = document.getElementById('assistant-panel');
    if (toggleBtn && (toggleBtn.contains(e.target) || e.target.id === 'assistant-toggle')) {
      const isVisible = panel.style.display === 'flex';
      panel.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && document.getElementById('assistant-messages').children.length === 0) {
        addMessage("Namaste! I am your VoteIndia Assistant.");
        showOptions(modes);
      }
    }
    if (e.target.id === 'close-assistant' || e.target.closest('#close-assistant')) {
      if (panel) panel.style.display = 'none';
    }
  }

  function handleLanguageControls(e) {
    if (e.target.id === 'custom-language-trigger' || e.target.closest('#custom-language-trigger')) {
      document.getElementById('language-modal').style.display = 'flex';
    }
    if (e.target.id === 'close-lang-modal') {
      document.getElementById('language-modal').style.display = 'none';
    }
    if (e.target.id === 'reset-lang') switchLanguage('', 'English', showToast);
  }

  function handleAuthUI(e) {
    const loginTab = document.getElementById('tab-login');
    const regTab = document.getElementById('tab-register');
    if (e.target.id === 'tab-login' || e.target.id === 'tab-register') {
      const isLogin = e.target.id === 'tab-login';
      loginTab.classList.toggle('active', isLogin);
      regTab.classList.toggle('active', !isLogin);
      document.getElementById('auth-title').textContent = isLogin ? 'Welcome Back' : 'Join the Movement';
      document.getElementById('auth-submit').textContent = isLogin ? 'Access Dashboard' : 'Create Account';
      document.getElementById('name-group').style.display = isLogin ? 'none' : 'block';
    }
    if (e.target.id === 'logout-btn') auth.signOut().then(() => location.reload());
  }

  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;
      const isLogin = document.getElementById('tab-login').classList.contains('active');
      const submitBtn = document.getElementById('auth-submit');
      try {
        if(submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wait...'; }
        await handleAuth(email, pass, !isLogin);
      } catch (err) {
        showToast(err.message, true);
        if(submitBtn) { submitBtn.disabled = false; submitBtn.textContent = isLogin ? 'Access Dashboard' : 'Create Account'; }
      }
    };
  }

  function updateDashboardUI(profile) {
    const nameEl = document.getElementById('display-name');
    const locEl = document.getElementById('user-location');
    if (nameEl) nameEl.textContent = profile.name || 'Citizen';
    if (locEl) locEl.textContent = `${profile.constituency}, ${profile.state}`;
  }

  function initEvmNavigation() {
    const openBtn = document.getElementById('open-evm-btn');
    const backBtn = document.getElementById('back-to-dash-evm');
    const evmScreen = document.getElementById('evm-screen');
    if (openBtn && backBtn && evmScreen) {
      openBtn.onclick = () => { appScreen.style.display = 'none'; evmScreen.style.display = 'block'; window.scrollTo(0,0); };
      backBtn.onclick = () => { evmScreen.style.display = 'none'; appScreen.style.display = 'block'; };
    }
  }

  function initExplainerNavigation() {
    const openBtn = document.getElementById('goto-explainer-btn');
    const backBtn = document.getElementById('back-to-dash-btn');
    const explainerScreen = document.getElementById('explainer-screen');
    if (openBtn && backBtn && explainerScreen) {
      openBtn.onclick = () => { appScreen.style.display = 'none'; explainerScreen.style.display = 'block'; window.scrollTo(0,0); };
      backBtn.onclick = () => { explainerScreen.style.display = 'none'; appScreen.style.display = 'block'; };
    }
  }
});
