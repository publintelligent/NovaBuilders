import {useMemo, useState} from 'react';
import {Bid, BidStatus} from '../utils/types';

export function useBidSearch(bids: Bid[]) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BidStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'client'>('date');

  const filtered = useMemo(() => {
    let result = [...bids];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        b =>
          b.clientName.toLowerCase().includes(q) ||
          b.projectType.toLowerCase().includes(q) ||
          b.bidNumber.toLowerCase().includes(q) ||
          b.projectAddress.toLowerCase().includes(q) ||
          b.clientEmail.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'amount') return b.grandTotal - a.grandTotal;
      if (sortBy === 'client') return a.clientName.localeCompare(b.clientName);
      return 0;
    });

    return result;
  }, [bids, query, statusFilter, sortBy]);

  const totalValue = useMemo(
    () => filtered.reduce((s, b) => s + b.grandTotal, 0),
    [filtered],
  );

  return {
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filtered,
    totalValue,
    count: filtered.length,
  };
}
