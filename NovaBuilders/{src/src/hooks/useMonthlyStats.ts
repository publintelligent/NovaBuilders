import {useMemo} from 'react';
import {Bid} from '../utils/types';

export interface MonthlyStats {
  totalValue: number;
  count: number;
  sent: number;
  accepted: number;
  draft: number;
  winRate: number;
  avgBidValue: number;
  vsLastMonth: number; // percentage change
}

export function useMonthlyStats(bids: Bid[]): MonthlyStats {
  return useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthBids = bids.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const lastMonthBids = bids.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const totalValue = thisMonthBids.reduce((s, b) => s + b.grandTotal, 0);
    const lastMonthValue = lastMonthBids.reduce((s, b) => s + b.grandTotal, 0);
    const sent = thisMonthBids.filter(b => b.status === 'sent').length;
    const accepted = thisMonthBids.filter(b => b.status === 'accepted').length;
    const draft = thisMonthBids.filter(b => b.status === 'draft').length;
    const decided = sent + accepted + thisMonthBids.filter(b => b.status === 'declined').length;
    const winRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;
    const avgBidValue = thisMonthBids.length > 0 ? Math.round(totalValue / thisMonthBids.length) : 0;
    const vsLastMonth =
      lastMonthValue > 0
        ? Math.round(((totalValue - lastMonthValue) / lastMonthValue) * 100)
        : 0;

    return {
      totalValue,
      count: thisMonthBids.length,
      sent,
      accepted,
      draft,
      winRate,
      avgBidValue,
      vsLastMonth,
    };
  }, [bids]);
}
