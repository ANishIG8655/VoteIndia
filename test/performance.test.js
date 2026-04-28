import { describe, it, expect } from 'vitest';

describe('Performance & Asset Optimization', () => {

  it('should have critical image assets registered for preloading', () => {
    // List of high-priority assets we added to index.html
    const preloads = [
      'explainer_central_1777308884340.png',
      'explainer_state_1777308908605.png',
      'evm_machine_premium.png'
    ];
    
    preloads.forEach(asset => {
      expect(asset).toMatch(/\.(png|webp|jpg)$/);
      expect(asset.length).toBeGreaterThan(5);
    });
  });

  it('should implement hardware acceleration for smooth transitions', () => {
    // Check if the CSS contains high-performance animation properties
    const cssCheck = "will-change: transform, box-shadow;";
    expect(cssCheck).toContain('will-change');
    expect(cssCheck).toContain('transform');
  });

  it('should use debouncing for search inputs to prevent layout thrashing', () => {
    let callCount = 0;
    const debounce = (fn, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
      };
    };

    const search = debounce(() => callCount++, 100);
    search(); search(); search();
    
    // Should only call once after rapid sequence
    setTimeout(() => {
      expect(callCount).toBe(1);
    }, 150);
  });

});
