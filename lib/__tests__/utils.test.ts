import { describe, it, expect } from 'vitest';
import { calculateProgress, formatDday, generateId } from '../utils';

describe('calculateProgress', () => {
  it('returns 0 for empty checklist', () => {
    expect(calculateProgress([])).toBe(0);
  });
  it('returns 50 for half checked', () => {
    const items = [
      { id: '1', text: 'a', checked: true },
      { id: '2', text: 'b', checked: false },
    ];
    expect(calculateProgress(items)).toBe(50);
  });
  it('returns 100 for all checked', () => {
    const items = [
      { id: '1', text: 'a', checked: true },
      { id: '2', text: 'b', checked: true },
    ];
    expect(calculateProgress(items)).toBe(100);
  });
  it('rounds to nearest integer', () => {
    const items = [
      { id: '1', text: 'a', checked: true },
      { id: '2', text: 'b', checked: false },
      { id: '3', text: 'c', checked: false },
    ];
    expect(calculateProgress(items)).toBe(33);
  });
});

describe('formatDday', () => {
  it('returns null for null input', () => {
    expect(formatDday(null)).toBeNull();
  });
  it('returns D-Day for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(formatDday(today)).toBe('D-Day');
  });
  it('returns D-N for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const dateStr = future.toISOString().split('T')[0];
    expect(formatDday(dateStr)).toBe('D-5');
  });
  it('returns D+N for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const dateStr = past.toISOString().split('T')[0];
    expect(formatDday(dateStr)).toBe('D+3');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
