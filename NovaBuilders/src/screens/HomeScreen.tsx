import React, {useMemo} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useBids} from '../context/BidsContext';
import {COLORS, RADIUS, SHADOWS} from '../utils/theme';
import {formatCurrency, formatDate, initials, avatarColor} from '../utils/calculations';
import {Bid, STATUS_COLORS} from '../utils/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {bids} = useBids();

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthBids = bids.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const total = monthBids.reduce((s, b) => s + b.grandTotal, 0);
    const sent = monthBids.filter(b => b.status === 'sent').length;
    const accepted = monthBids.filter(b => b.status === 'accepted').length;
    return {total, sent, accepted, count: monthBids.length};
  }, [bids]);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/icon_xhdpi.png')}
          style={styles.logoImg}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.headerTitle}>Nova Builders</Text>
          <Text style={styles.headerSub}>Estimator Pro</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total bids this month</Text>
          <Text style={styles.heroAmount}>{formatCurrency(stats.total)}</Text>
          <Text style={styles.heroSub}>
            {stats.sent} sent · {stats.accepted} accepted
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.qaGrid}>
          <TouchableOpacity
            style={styles.qaCard}
            onPress={() => navigation.navigate('New Bid')}>
            <Text style={styles.qaIcon}>🤖</Text>
            <Text style={styles.qaTitle}>AI Estimate</Text>
            <Text style={styles.qaSub}>Upload plans → instant bid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.qaCard}
            onPress={() => navigation.navigate('My Bids')}>
            <Text style={styles.qaIcon}>📤</Text>
            <Text style={styles.qaTitle}>Send Bid</Text>
            <Text style={styles.qaSub}>Email PDF to client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaCard}>
            <Text style={styles.qaIcon}>📊</Text>
            <Text style={styles.qaTitle}>Analytics</Text>
            <Text style={styles.qaSub}>Win rate & margins</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaCard}>
            <Text style={styles.qaIcon}>👥</Text>
            <Text style={styles.qaTitle}>Clients</Text>
            <Text style={styles.qaSub}>Manage contacts</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Recent Bids</Text>

        {bids.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bids yet. Tap "New Bid" to get started.</Text>
          </View>
        )}

        {bids.slice(0, 10).map(bid => (
          <BidRow
            key={bid.id}
            bid={bid}
            onPress={() => navigation.navigate('BidDetail', {bidId: bid.id})}
          />
        ))}

        <View style={{height: 24}} />
      </ScrollView>
    </View>
  );
}

function BidRow({bid, onPress}: {bid: Bid; onPress: () => void}) {
  const av = avatarColor(bid.clientName);
  const statusStyle = STATUS_COLORS[bid.status];
  return (
    <TouchableOpacity style={styles.bidItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, {backgroundColor: av.bg}]}>
        <Text style={[styles.avatarText, {color: av.text}]}>
          {initials(bid.clientName)}
        </Text>
      </View>
      <View style={styles.bidInfo}>
        <Text style={styles.bidName}>{bid.clientName}</Text>
        <Text style={styles.bidDesc} numberOfLines={1}>
          {bid.projectType} · {bid.bidNumber}
        </Text>
      </View>
      <View style={styles.bidRight}>
        <Text style={styles.bidAmount}>{formatCurrency(bid.grandTotal)}</Text>
        <View style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
          <Text style={[styles.statusText, {color: statusStyle.text}]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.dark2},
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.dark, paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#333',
  },
  logoImg: {width: 34, height: 34, borderRadius: 8},
  headerTitle: {color: '#fff', fontSize: 16, fontWeight: '500'},
  headerSub: {color: '#888', fontSize: 11, marginTop: 1},
  onlineDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.success, marginLeft: 'auto',
  },
  scroll: {flex: 1},
  heroCard: {
    backgroundColor: COLORS.dark, margin: 16, marginBottom: 12,
    borderRadius: RADIUS.lg, padding: 20,
  },
  heroLabel: {color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1},
  heroAmount: {color: COLORS.goldLight, fontSize: 30, fontWeight: '500', marginTop: 4},
  heroSub: {color: '#aaa', fontSize: 12, marginTop: 2},
  qaGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 16, marginBottom: 12,
  },
  qaCard: {
    width: '47%', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  qaIcon: {fontSize: 24, marginBottom: 8},
  qaTitle: {fontSize: 13, fontWeight: '500', color: COLORS.text},
  qaSub: {fontSize: 11, color: COLORS.textMuted, marginTop: 2},
  sectionLabel: {
    fontSize: 12, fontWeight: '500', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginHorizontal: 16, marginTop: 4,
  },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 24, alignItems: 'center', marginHorizontal: 16,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  emptyText: {fontSize: 14, color: COLORS.textMuted, textAlign: 'center'},
  bidItem: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 14, marginHorizontal: 16, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {fontSize: 14, fontWeight: '500'},
  bidInfo: {flex: 1},
  bidName: {fontSize: 14, fontWeight: '500', color: COLORS.text},
  bidDesc: {fontSize: 11, color: COLORS.textMuted, marginTop: 2},
  bidRight: {alignItems: 'flex-end'},
  bidAmount: {fontSize: 14, fontWeight: '500', color: COLORS.text},
  statusBadge: {borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 3},
  statusText: {fontSize: 10},
});
