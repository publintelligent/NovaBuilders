import {Division} from './types';

export function calcTotals(
  divisions: Division[],
  overheadPct: number,
  profitPct: number,
) {
  const directTotal = divisions
    .filter(d => d.included)
    .reduce((sum, d) => sum + d.directCost, 0);

  const overheadAmount = directTotal * (overheadPct / 100);
  const base = directTotal + overheadAmount;
  const profitAmount = base * (profitPct / 100);
  const grandTotal = Math.round((base + profitAmount) / 1000) * 1000;

  return {directTotal, overheadAmount, profitAmount, grandTotal};
}

export function generateBidNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900) + 100;
  return `NB-${year}-${seq}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Avatar background colors cycling
const AVATAR_COLORS = [
  {bg: 'rgba(184,134,11,0.15)', text: '#92650a'},
  {bg: 'rgba(52,211,153,0.15)', text: '#065f46'},
  {bg: 'rgba(96,165,250,0.15)', text: '#1e40af'},
  {bg: 'rgba(167,139,250,0.15)', text: '#5b21b6'},
  {bg: 'rgba(251,146,60,0.15)', text: '#c2410c'},
  {bg: 'rgba(248,113,113,0.15)', text: '#991b1b'},
];

export function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
