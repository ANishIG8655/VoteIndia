import { describe, it, expect } from 'vitest';
import { electionQuiz } from '../src/quizData';

describe('Election Quiz Logic', () => {
  it('should have exactly 10 questions', () => {
    expect(electionQuiz.length).toBe(10);
  });

  it('should have valid options for every question', () => {
    electionQuiz.forEach(q => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(typeof q.correct).toBe('number');
      expect(q.correct).toBeLessThan(q.options.length);
    });
  });

  it('should provide an explanation for every answer', () => {
    electionQuiz.forEach(q => {
      expect(q.explanation.length).toBeGreaterThan(10);
    });
  });
});
