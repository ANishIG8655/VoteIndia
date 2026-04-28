import { describe, it, expect } from 'vitest';
import { indiaElections, kycDatabase } from '../src/electionData';

describe('Electoral Data Integrity', () => {
  
  it('should have all 8 steps in the election process', () => {
    expect(indiaElections.process.length).toBe(8);
  });

  it('should have KYC data for core constituencies', () => {
    expect(kycDatabase).toHaveProperty('varanasi');
    expect(kycDatabase).toHaveProperty('wayanad');
    expect(kycDatabase.varanasi.length).toBeGreaterThan(0);
  });

  it('should not contain placeholder "lorem ipsum" text', () => {
    const dataStr = JSON.stringify(indiaElections);
    expect(dataStr.toLowerCase()).not.toContain('lorem ipsum');
  });

  it('should have valid past results years', () => {
    indiaElections.pastResults.forEach(r => {
      expect(r.year).toBeLessThanOrEqual(new Date().getFullYear());
    });
  });

});
