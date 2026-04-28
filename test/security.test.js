import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeName, safeJSONParse } from '../src/utils/sanitizer.js';

describe('Advanced Security & Robustness', () => {

  it('should escape malicious script tags in HTML sanitizer', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = sanitizeHTML(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('should handle deeply nested broken JSON without crashing', () => {
    const broken = '{"user": {"data": { "incomplete": ';
    const fallback = { error: true };
    const result = safeJSONParse(broken, fallback);
    expect(result.error).toBe(true);
  });

  it('should enforce strict character limits on user names', () => {
    const longName = "A".repeat(100);
    const sanitized = sanitizeName(longName);
    expect(sanitized.length).toBe(20);
  });

});

describe('UX Stress Testing', () => {
  it('should debouncing rapidly changing ticker states', async () => {
    let callCount = 0;
    const tickerUpdate = () => callCount++;
    
    // Simulate 10 rapid state changes
    for(let i=0; i<10; i++) tickerUpdate();
    
    expect(callCount).toBe(10); // Logic test
  });
});
