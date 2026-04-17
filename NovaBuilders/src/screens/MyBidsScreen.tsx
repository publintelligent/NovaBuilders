import React, {useState, useMemo} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useBids} from '../context/BidsContext';
import {COLORS, RADIUS} from '../utils/theme';
import {formatCurrency, formatDate, initials, avatarColor} from '../utils/calculations';
import {Bid, BidStatus, STATUS_COLORS} from '../utils/types';

const FILTERS: {label: string; value: BidStatus | 'all'}[] = [
  {label: 'All', value: 'all'},
  {label: 'Draft', value: 'draft'},
  {label: 'Sent', value: 'sent'},
  {label: 'Accepted', value: 'accepted'},
  {label: 'Declined', value: 'declined'},
];

export default function MyBidsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {bids} = useBids();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BidStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return bids.filter(b => {
      const matchFilter = filter === 'all' || b.status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.clientName.toLowerCase().includes(q) ||
        b.projectType.toLowerCase().includes(q) ||
        b.bidNumber.toLowerCase().includes(q) ||
        b.projectAddress.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [bids, search, filter]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, Bid[]> = {};
    filtered.forEach(b => {
      const d = new Date(b.createdAt);
      const key = d.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return groups;
  }, [filtered]);

  const totalValue = filtered.reduce((s, b) => s + b.grandTotal, 0);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bids</Text>
        <Text style={styles.headerSub}>{filtered.length} bids · {formatCurrency(totalValue)}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by client, type, bid #..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}>
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {Object.keys(grouped).length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bids found</Text>
            <Text style={styles.emptySub}>
              {search ? 'Try a different search term' : 'Create your first bid to get started'}
            </Text>
          </View>
        )}

        {Object.entries(grouped).map(([month, monthBids]) => (
          <View key={month}>
            <Text style={styles.monthLabel}>{month}</Text>
            {monthBids.map(bid => (
              <TouchableOpacity
                key={bid.id}
                style={styles.bidCard}
                onPress={() => navigation.navigate('BidDetail', {bidId: bid.id})}
                activeOpacity={0.7}>
                <BidCardContent bid={bid} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={{height: 24}} />
      </ScrollView>
    </View>
  );
}

function BidCardContent({bid}: {bid: Bid}) {
  const av = avatarColor(bid.clientName);
  const statusStyle = STATUS_COLORS[bid.status];
  return (
    <View style={styles.bidInner}>
      <View style={[styles.avatar, {backgroundColor: av.bg}]}>
        <Text style={[styles.avatarText, {color: av.text}]}>{initials(bid.clientName)}</Text>
      </View>
      <View style={styles.bidInfo}>
        <View style={styles.bidTopRow}>
          <Text style={styles.bidName}>{bid.clientName}</Text>
          <Text style={styles.bidAmount}>{formatCurrency(bid.grandTotal)}</Text>
        </View>
        <View style={styles.bidBottomRow}>
          <Text style={styles.bidDesc} numberOfLines={1}>{bid.projectType}</Text>
          <View style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.statusText, {color: statusStyle.text}]}>{statusStyle.label}</Text>
          </View>
        </View>
        <Text style={styles.bidMeta}>{bid.bidNumber} · {formatDate(bid.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.dark2},
  header: {
    backgroundColor: COLORS.dark, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#333',
  },
  headerTitle: {color: '#fff', fontSize: 18, fontWeight: '500'},
  headerSub: {color: '#888', fontSize: 11, marginTop: 2},
  searchBar: {padding: 12, paddingBottom: 0, backgroundColor: COLORS.dark},
  searchInput: {
    backgroundColor: '#1e1e1e', borderRadius: RADIUS.md, padding: 10,
    fontSize: 14, color: '#fff', borderWidth: 0.5, borderColor: '#333',
  },
  filterScroll: {backgroundColor: COLORS.dark, maxHeight: 52},
  filterContent: {paddingHorizontal: 12, paddingVertical: 10, gap: 8},
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 0.5, borderColor: '#333', backgroundColor: '#1e1e1e',
  },
  filterChipActive: {backgroundColor: COLORS.goldDim, borderColor: COLORS.gold},
  filterText: {fontSize: 13, color: '#888'},
  filterTextActive: {color: COLORS.goldLight},
  scroll: {flex: 1},
  monthLabel: {
    fontSize: 12, fontWeight: '500', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: 16, marginTop: 16, marginBottom: 8,
  },
  bidCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 8,
    borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border,
  },
  bidInner: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14},
  avatar: {width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 14, fontWeight: '500'},
  bidInfo: {flex: 1},
  bidTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  bidName: {fontSize: 14, fontWeight: '500', color: COLORS.text},
  bidAmount: {fontSize: 14, fontWeight: '500', color: COLORS.text},
  bidBottomRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4},
  bidDesc: {fontSize: 12, color: COLORS.textMuted, flex: 1},
  bidMeta: {fontSize: 11, color: COLORS.textLight, marginTop: 4},
  statusBadge: {borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2},
  statusText: {fontSize: 10},
  emptyWrap: {alignItems: 'center', padding: 48},
  emptyIcon: {fontSize: 40, marginBottom: 12},
  emptyTitle: {fontSize: 17, fontWeight: '500', color: COLORS.text, marginBottom: 6},
  emptySub: {fontSize: 13, color: COLORS.textMuted, textAlign: 'center'},
});
