import { trackEvent } from '../services/AnalyticsService.js';
import { showToast } from './ui.js';

/**
 * Error Boundary: Catch and report runtime exceptions
 */
export const initErrorBoundary = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('🛑 Global Error:', { message, source, lineno, error });
    
    trackEvent('exception', {
      description: message,
      fatal: true,
      error_line: lineno
    });

    showToast("Something went wrong. We've notified the engineers.", true);
    return true; // Prevent default browser error reporting
  };

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🛑 Unhandled Promise Rejection:', event.reason);
    
    trackEvent('promise_rejection', {
      reason: event.reason?.message || 'Unknown'
    });
  });
};
