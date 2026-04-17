import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Bid, STATUS_COLORS} from '../utils/types';
import {formatCurrency, formatDate, initials, avatarColor} from '../utils/calculations';
import {COLORS, RADIUS} from '../utils/theme';

interface Props {
  bid: Bid;
  onPress: () => void;
  showDate?: boolean;
}

export default function BidCard({bid, onPress, showDate = true}: Props) {
  const av = avatarColor(bid.clientName);
  const statusStyle = STATUS_COLORS[bid.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.72}>
      <View style={[styles.avatar, {backgroundColor: av.bg}]}>
        <Text style={[styles.avatarText, {color: av.text}]}>
          {initials(bid.clientName)}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.clientName} numberOfLines={1}>{bid.clientName}</Text>
          <Text style={styles.amount}>{formatCurrency(bid.grandTotal)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.projectType} numberOfLines={1}>{bid.projectType}</Text>
          <View style={[styles.badge, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.badgeText, {color: statusStyle.text}]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        {showDate && (
          <Text style={styles.meta}>
            {bid.bidNumber} · {formatDate(bid.createdAt)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {fontSize: 14, fontWeight: '500'},
  info: {flex: 1, minWidth: 0},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  amount: {fontSize: 14, fontWeight: '500', color: COLORS.text, flexShrink: 0},
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  projectType: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 0,
  },
  badgeText: {fontSize: 10},
  meta: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
  },
});
