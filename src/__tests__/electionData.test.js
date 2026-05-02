import { describe, it, expect } from 'vitest';
import { kycDatabase, modes } from './src/electionData.js';

describe('VoteWise Election Data Integrity', () => {
  it('should have a complete list of modes with unique IDs', () => {
    const ids = modes.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    expect(ids).toContain('my_constituency');
  });

  it('should have verified candidate profiles for key constituencies', () => {
    expect(kycDatabase).toHaveProperty('varanasi');
    expect(kycDatabase.varanasi.length).toBeGreaterThan(0);
    expect(kycDatabase.varanasi[0].name).toBe('Narendra Modi');
  });

  it('should provide formatted assets and education data', () => {
    const modi = kycDatabase.varanasi[0];
    expect(modi.assets).toMatch(/₹/);
    expect(modi.party).toBe('BJP');
  });

  it('should handle missing constituencies gracefully', () => {
    expect(kycDatabase['invalid_place']).toBeUndefined();
  });
});
