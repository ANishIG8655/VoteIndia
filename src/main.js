/**
 * VoteWise India - Main Orchestrator
 * Clean Architecture Implementation: Orchestrates modular services and components.
 */
import './style.css';
import { auth, db } from './services/firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import { showToast, initParallax } from './utils/ui.js';
import { initLanguagePicker } from './services/language.js';
import { getUserProfile } from './services/auth.js';
import { initNavigation } from './services/NavigationManager.js';
import { initAuthUI } from './services/AuthUIHandler.js';
import { initGlobalUI } from './services/UIManager.js';
import { initErrorBoundary } from './utils/errorBoundary.js';

// Global DB Reference for Legacy Support
window.db = db;

// 1. PWA Service Worker & Install Management
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showToast("📲 Add VoteWise to your home screen for quick access!", false, () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') console.log('User accepted install');
      deferredPrompt = null;
    });
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ PWA Service Worker Active'))
      .catch(err => console.error('❌ SW Registration Failed:', err));
  });
}

// 2. Connectivity Monitoring
window.addEventListener('online', () => showToast("🌐 Connection Restored. Live data syncing...", false));
window.addEventListener('offline', () => {
  showToast("📡 Connection Lost. Switching to Offline Mode.", true);
  setTimeout(() => { window.location.href = '/offline.html'; }, 1000);
});

// 3. Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Error Handling First
  initErrorBoundary();
  
  const appScreen = document.getElementById('app-screen');
  const authScreen = document.getElementById('auth-screen');
  const splashScreen = document.getElementById('global-splash');
  const splashProgress = document.getElementById('splash-progress');

  if (splashProgress) splashProgress.style.width = '100%';

  // Core Orchestration
  const navManager = initNavigation(appScreen);
  initAuthUI();
  initGlobalUI();

  // Lifecycle Management
  const hideSplash = () => {
    if (splashScreen && splashScreen.style.display !== 'none') {
      splashScreen.style.opacity = '0';
      setTimeout(() => { 
        splashScreen.style.display = 'none';
        bootstrapProductionFeatures();
      }, 400);
    }
  };

  // Auth State Listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (authScreen) authScreen.style.display = 'none';
      if (appScreen) appScreen.style.display = 'block';
      hideSplash();
      
      const profile = await getUserProfile(user.uid);
      if (profile) updateProfileUI(profile);
    } else {
      if (appScreen) appScreen.style.display = 'none';
      if (authScreen) authScreen.style.display = 'flex';
      hideSplash();
    }
  });

  /**
   * Lazy-loads production features for performance optimization
   */
  async function bootstrapProductionFeatures() {
    const [ { initTicker }, { initQuiz }, { initDashboard } ] = await Promise.all([
      import('./components/Ticker.js'),
      import('./components/Quiz.js'),
      import('./components/Dashboard.js')
    ]);
    
    initParallax();
    initTicker(document.getElementById('trends-container'));
    initQuiz();
    initDashboard();
    initLanguagePicker(document.getElementById('language-grid'), showToast);
    
    console.log("⚡ All production modules bootstrapped successfully.");
  }

  function updateProfileUI(profile) {
    const nameEl = document.getElementById('display-name');
    const locEl = document.getElementById('user-location');
    if (nameEl) nameEl.textContent = profile.name || 'Citizen';
    if (locEl) locEl.textContent = `${profile.constituency}, ${profile.state}`;
  }
});
