import {renderHook, act} from '@testing-library/react-native';
import {useBidSearch} from '../src/hooks/useBidSearch';
import {Bid} from '../src/utils/types';

const mockBids: Bid[] = [
  {
    id: '1',
    bidNumber: 'NB-2026-001',
    clientName: 'Kunz Family',
    clientEmail: 'kunz@email.com',
    projectAddress: '8241 Top of the World Drive',
    projectType: 'Garage Addition',
    squareFeet: 686,
    divisions: [],
    overheadPct: 12,
    profitPct: 15,
    directTotal: 166378,
    overheadAmount: 19965,
    profitAmount: 27952,
    grandTotal: 214000,
    status: 'sent',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    bidNumber: 'NB-2026-002',
    clientName: 'Martinez Residence',
    clientEmail: 'martinez@email.com',
    projectAddress: '123 Oak Street',
    projectType: 'Kitchen Remodel',
    squareFeet: 320,
    divisions: [],
    overheadPct: 12,
    profitPct: 15,
    directTotal: 80000,
    overheadAmount: 9600,
    profitAmount: 13440,
    grandTotal: 103000,
    status: 'accepted',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    bidNumber: 'NB-2026-003',
    clientName: 'Thompson ADU',
    clientEmail: 'thompson@email.com',
    projectAddress: '456 Pine Ave',
    projectType: 'ADU / Guest House',
    squareFeet: 640,
    divisions: [],
    overheadPct: 12,
    profitPct: 15,
    directTotal: 60000,
    overheadAmount: 7200,
    profitAmount: 10080,
    grandTotal: 77000,
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

describe('useBidSearch', () => {
  it('returns all bids with no filters', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    expect(result.current.filtered).toHaveLength(3);
  });

  it('filters by status', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setStatusFilter('sent'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].clientName).toBe('Kunz Family');
  });

  it('filters by search query on clientName', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setQuery('kunz'));
    expect(result.current.filtered).toHaveLength(1);
  });

  it('filters by search query on projectType', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setQuery('kitchen'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].clientName).toBe('Martinez Residence');
  });

  it('search is case-insensitive', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setQuery('THOMPSON'));
    expect(result.current.filtered).toHaveLength(1);
  });

  it('returns empty array when no match', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setQuery('zzznomatch'));
    expect(result.current.filtered).toHaveLength(0);
  });

  it('calculates totalValue correctly', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    const expected = 214000 + 103000 + 77000;
    expect(result.current.totalValue).toBe(expected);
  });

  it('sorts by amount descending', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setSortBy('amount'));
    expect(result.current.filtered[0].grandTotal).toBe(214000);
    expect(result.current.filtered[2].grandTotal).toBe(77000);
  });

  it('sorts by client name alphabetically', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setSortBy('client'));
    expect(result.current.filtered[0].clientName).toBe('Kunz Family');
  });

  it('resets correctly when query is cleared', () => {
    const {result} = renderHook(() => useBidSearch(mockBids));
    act(() => result.current.setQuery('kunz'));
    expect(result.current.filtered).toHaveLength(1);
    act(() => result.current.setQuery(''));
    expect(result.current.filtered).toHaveLength(3);
  });
});
