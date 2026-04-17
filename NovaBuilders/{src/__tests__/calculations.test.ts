import {
  calcTotals,
  generateBidNumber,
  formatCurrency,
  formatDate,
  initials,
  avatarColor,
} from '../src/utils/calculations';
import {Division} from '../src/utils/types';

const mockDivisions: Division[] = [
  {id: 'demo', label: 'Demolition', directCost: 12422, included: true},
  {id: 'found', label: 'Foundation', directCost: 13199, included: true},
  {id: 'frame', label: 'Framing', directCost: 26301, included: true},
  {id: 'deck', label: 'Deck', directCost: 21404, included: false},
];

describe('calcTotals', () => {
  it('excludes divisions with included=false', () => {
    const {directTotal} = calcTotals(mockDivisions, 12, 15);
    expect(directTotal).toBe(12422 + 13199 + 26301);
  });

  it('applies overhead correctly', () => {
    const {directTotal, overheadAmount} = calcTotals(mockDivisions, 12, 15);
    expect(overheadAmount).toBeCloseTo(directTotal * 0.12, 0);
  });

  it('applies profit on (direct + overhead)', () => {
    const {directTotal, overheadAmount, profitAmount} = calcTotals(mockDivisions, 12, 15);
    const base = directTotal + overheadAmount;
    expect(profitAmount).toBeCloseTo(base * 0.15, 0);
  });

  it('rounds grand total to nearest $1,000', () => {
    const {grandTotal} = calcTotals(mockDivisions, 12, 15);
    expect(grandTotal % 1000).toBe(0);
  });

  it('handles zero divisions', () => {
    const {directTotal, grandTotal} = calcTotals([], 12, 15);
    expect(directTotal).toBe(0);
    expect(grandTotal).toBe(0);
  });

  it('handles 0% overhead and 0% profit', () => {
    const {directTotal, overheadAmount, profitAmount} = calcTotals(mockDivisions, 0, 0);
    expect(overheadAmount).toBe(0);
    expect(profitAmount).toBe(0);
  });
});

describe('generateBidNumber', () => {
  it('starts with NB-', () => {
    expect(generateBidNumber()).toMatch(/^NB-/);
  });

  it('includes the current year', () => {
    const year = new Date().getFullYear().toString();
    expect(generateBidNumber()).toContain(year);
  });

  it('has correct format NB-YYYY-NNN', () => {
    expect(generateBidNumber()).toMatch(/^NB-\d{4}-\d{3}$/);
  });
});

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(214000)).toBe('$214,000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('rounds decimals', () => {
    expect(formatCurrency(1500.75)).toBe('$1,501');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    const result = formatDate('2026-04-15T00:00:00.000Z');
    expect(result).toMatch(/Apr/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2026/);
  });
});

describe('initials', () => {
  it('returns first letters of each word', () => {
    expect(initials('Kunz Family')).toBe('KF');
  });

  it('handles single name', () => {
    expect(initials('Johnson')).toBe('JO');
  });

  it('caps at 2 characters', () => {
    expect(initials('John Michael Smith')).toBe('JM');
  });
});

describe('avatarColor', () => {
  it('returns bg and text colors', () => {
    const color = avatarColor('Kunz');
    expect(color).toHaveProperty('bg');
    expect(color).toHaveProperty('text');
  });

  it('is deterministic for the same name', () => {
    expect(avatarColor('Test')).toEqual(avatarColor('Test'));
  });
});
