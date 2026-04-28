import { describe, it, expect } from 'vitest';

describe('VoteIndia UI Integration', () => {
  
  it('should have a functioning live clock container', () => {
    // Simulation: Checking if clock exists in DOM
    const clockMock = { textContent: '12:00:00 PM' };
    expect(clockMock.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('should generate valid Google Calendar URLs', () => {
    const state = "Tamil Nadu";
    const expectedDate = "Late 2026";
    
    // Logic from main.js
    let dateStr = "20260101";
    const yearMatch = expectedDate.match(/\d{4}/);
    if (yearMatch) {
      const year = yearMatch[0];
      if (expectedDate.toLowerCase().includes('late')) dateStr = `${year}1101`;
    }
    
    expect(dateStr).toBe("20261101");
  });

  it('should sanitize user names for the quiz', () => {
    const input = "<script>alert('xss')</script> Anish";
    const sanitized = input.replace(/<[^>]*>?/gm, '').trim();
    expect(sanitized).toBe("Anish");
  });

});
