/**
 * Navigation Manager: Orchestrates screen transitions, deep linking, and SEO tracking.
 * @module NavigationManager
 */
import { Analytics } from './AnalyticsService.js';

/**
 * Initializes the navigation system and sets the initial view.
 * @param {HTMLElement} appScreen - The primary dashboard container.
 */
export const initNavigation = (appScreen) => {
  if (!appScreen) {
    console.error("Navigation Error: Root screen element missing.");
    return;
  }

  const screens = {
    dashboard: appScreen,
    evm: document.getElementById('evm-screen'),
    explainer: document.getElementById('explainer-screen')
  };

  /**
   * Switches the visible screen and scrolls to the top.
   * @param {string} screenName - The key of the screen to show.
   */
  const showScreen = (screenName) => {
    try {
      // Hide all known screens
      Object.values(screens).forEach(s => {
        if (s) s.style.display = 'none';
      });

      const target = screens[screenName];
      if (target) {
        target.style.display = 'block';
        window.scrollTo(0, 0);
        Analytics.trackScreen(screenName);
      } else {
        throw new Error(`Screen "${screenName}" not found.`);
      }
    } catch (err) {
      console.error("Navigation Failure:", err);
      screens.dashboard.style.display = 'block'; // Fallback
    }
  };

  // Attach Event Listeners safely
  document.getElementById('open-evm-btn')?.addEventListener('click', () => showScreen('evm'));
  document.getElementById('goto-explainer-btn')?.addEventListener('click', () => showScreen('explainer'));
  
  const backButtons = document.querySelectorAll('.back-to-dashboard');
  backButtons.forEach(btn => {
    btn.addEventListener('click', () => showScreen('dashboard'));
  });

  return { showScreen };
};
