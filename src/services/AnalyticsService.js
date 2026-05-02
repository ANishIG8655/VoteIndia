/**
 * Analytics Service: Centralized Google Analytics Event Tracking
 * Provides a safe, production-grade interface for monitoring user engagement.
 */
export const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString(),
      platform: 'web'
    });
    console.log(`[Analytics] Tracked: ${eventName}`, params);
  } else {
    // Development fallback
    console.warn(`[Analytics] Analytics not initialized. Event skipped: ${eventName}`, params);
  }
};

/**
 * Predefined Tracking Methods for consistency
 */
export const Analytics = {
  // Navigation
  trackScreen: (screenName) => trackEvent('screen_view', { screen_name: screenName }),
  
  // KYC / Search
  trackSearch: (term, resultsCount) => trackEvent('search_constituency', { 
    search_term: term, 
    results_found: resultsCount 
  }),
  
  // Dashboard Interactions
  trackNewsClick: (title) => trackEvent('news_item_click', { news_title: title }),
  trackMilestoneReminder: (event) => trackEvent('milestone_reminder_added', { event_name: event }),
  
  // Assistant
  trackAssistantAsk: (queryId) => trackEvent('assistant_interaction', { query_id: queryId }),
  
  // PWA
  trackPWAInstall: () => trackEvent('pwa_install_triggered')
};
