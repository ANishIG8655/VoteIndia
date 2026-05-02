import { describe, it, expect } from 'vitest';
import { sanitizeHTML, isValidSearch } from '../utils/sanitizer.js';

describe('Security Sanitizer & Validation', () => {
  it('should strip HTML tags from malicious input', () => {
    const malicious = '<script>alert("XSS")</script>Hello';
    const sanitized = sanitizeHTML(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;Hello');
  });

  it('should validate search terms correctly', () => {
    expect(isValidSearch('Varanasi')).toBe(true);
    expect(isValidSearch('New Delhi')).toBe(true);
    expect(isValidSearch('Varanasi123')).toBe(false);
    expect(isValidSearch('V')).toBe(false); // Too short
    expect(isValidSearch('a'.repeat(51))).toBe(false); // Too long
  });

  it('should handle special characters safely', () => {
    const input = '<div>"Quotes" & Symbols</div>';
    const output = sanitizeHTML(input);
    expect(output).toBe('&lt;div&gt;"Quotes" &amp; Symbols&lt;/div&gt;');
  });
});
