/**
 * Navigation Manager: Handles screen transitions and SEO-friendly deep linking
 */
import { Analytics } from './AnalyticsService.js';

export const initNavigation = (appScreen) => {
  const screens = {
    dashboard: appScreen,
    evm: document.getElementById('evm-screen'),
    explainer: document.getElementById('explainer-screen')
  };

  const navigateTo = (screenName) => {
    Object.values(screens).forEach(s => if(s) s.style.display = 'none');
    if (screens[screenName]) {
      screens[screenName].style.display = screenName === 'dashboard' ? 'block' : (screenName === 'evm' || screenName === 'explainer' ? 'block' : 'flex');
      window.scrollTo(0, 0);
      
      // Analytics Tracking
      Analytics.trackScreen(screenName);
    }
  };

  const setupLinks = () => {
    document.getElementById('open-evm-btn')?.addEventListener('click', () => navigateTo('evm'));
    document.getElementById('back-to-dash-evm')?.addEventListener('click', () => navigateTo('dashboard'));
    document.getElementById('goto-explainer-btn')?.addEventListener('click', () => navigateTo('explainer'));
    document.getElementById('back-to-dash-btn')?.addEventListener('click', () => navigateTo('dashboard'));
  };

  setupLinks();
  return { navigateTo };
};
