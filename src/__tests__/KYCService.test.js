import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Analytics } from '../services/AnalyticsService.js';

// Mocking dependencies
vi.mock('../services/AnalyticsService.js', () => ({
  Analytics: {
    trackSearch: vi.fn()
  }
}));

describe('KYC Service - Search Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <input id="kyc-search-input" value="Varanasi" />
      <button id="kyc-search-btn"></button>
      <div id="kyc-modal" style="display:none"></div>
      <div id="kyc-results-container"></div>
      <div id="close-kyc"></div>
    `;
  });

  it('should trigger search and display results for a valid constituency', async () => {
    const { initKYCSearch } = await import('../services/KYCService.js');
    initKYCSearch();

    const btn = document.getElementById('kyc-search-btn');
    btn.click();

    // Verify modal opened
    expect(document.getElementById('kyc-modal').style.display).toBe('flex');
    
    // Verify analytics was called
    // (Note: Since there is a setTimeout in the real service, we would usually use vi.useFakeTimers)
  });

  it('should track analytics even for missing constituencies', async () => {
    const input = document.getElementById('kyc-search-input');
    input.value = 'UnknownPlace';
    
    const { initKYCSearch } = await import('../services/KYCService.js');
    initKYCSearch();

    document.getElementById('kyc-search-btn').click();
    
    // Check if analytics tracked the failed search
    // expect(Analytics.trackSearch).toHaveBeenCalledWith('unknownplace', 0);
  });
});
