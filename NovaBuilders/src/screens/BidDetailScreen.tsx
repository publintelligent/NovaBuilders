import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {useBids} from '../context/BidsContext';
import {COLORS, RADIUS} from '../utils/theme';
import {formatCurrency, formatDate, initials, avatarColor} from '../utils/calculations';
import {STATUS_COLORS} from '../utils/types';
import SendBidModal from '../components/SendBidModal';
import {saveBidHTML} from '../services/pdfService';

export default function BidDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {getBid, updateBid, deleteBid} = useBids();
  const [showSend, setShowSend] = useState(false);

  const bid = getBid(route.params?.bidId);
  if (!bid) {
    return (
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <Text style={{color: '#fff', margin: 20}}>Bid not found.</Text>
      </View>
    );
  }

  const av = avatarColor(bid.clientName);
  const statusStyle = STATUS_COLORS[bid.status];
  const includedDivisions = bid.divisions.filter(d => d.included);

  async function handleSend() {
    await saveBidHTML(bid);
    setShowSend(true);
  }

  function confirmDelete() {
    Alert.alert('Delete bid?', `This will permanently delete ${bid.bidNumber}.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteBid(bid.id);
          navigation.goBack();
          Toast.show({type: 'success', text1: 'Bid deleted'});
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bid.bidNumber}</Text>
        <TouchableOpacity onPress={confirmDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Client card */}
        <View style={styles.clientCard}>
          <View style={[styles.avatar, {backgroundColor: av.bg}]}>
            <Text style={[styles.avatarText, {color: av.text}]}>{initials(bid.clientName)}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{bid.clientName}</Text>
            <Text style={styles.clientEmail}>{bid.clientEmail}</Text>
            <Text style={styles.clientAddress} numberOfLines={1}>{bid.projectAddress}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.statusText, {color: statusStyle.text}]}>{statusStyle.label}</Text>
          </View>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <MetaStat label="Project type" value={bid.projectType} />
          <MetaStat label="Area" value={`${bid.squareFeet} SF`} />
          <MetaStat label="Created" value={formatDate(bid.createdAt)} />
        </View>

        {/* Divisions */}
        <SectionTitle>Cost Breakdown</SectionTitle>
        <View style={styles.card}>
          {includedDivisions.map((div, i) => (
            <View
              key={div.id}
              style={[styles.divRow, i === includedDivisions.length - 1 && styles.divRowLast]}>
              <Text style={styles.divLabel}>{div.label}</Text>
              <Text style={styles.divAmount}>{formatCurrency(div.directCost)}</Text>
            </View>
          ))}
        </View>

        {/* Pricing summary */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Direct costs</Text>
            <Text style={styles.pricingVal}>{formatCurrency(bid.directTotal)}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Overhead ({bid.overheadPct}%)</Text>
            <Text style={styles.pricingVal}>+ {formatCurrency(Math.round(bid.overheadAmount))}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Profit ({bid.profitPct}%)</Text>
            <Text style={styles.pricingVal}>+ {formatCurrency(Math.round(bid.profitAmount))}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{formatCurrency(bid.grandTotal)}</Text>
          </View>
        </View>

        {bid.notes ? (
          <>
            <SectionTitle>Notes</SectionTitle>
            <View style={[styles.card, {padding: 14}]}>
              <Text style={styles.notesText}>{bid.notes}</Text>
            </View>
          </>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnGold} onPress={handleSend}>
            <Text style={styles.btnGoldText}>📧  Send to Client</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnGhost}
            onPress={() => updateBid(bid.id, {status: 'accepted'})}>
            <Text style={styles.btnGhostText}>✓  Mark Accepted</Text>
          </TouchableOpacity>
        </View>

        <View style={{height: 32}} />
      </ScrollView>

      {showSend && (
        <SendBidModal bidId={bid.id} onClose={() => setShowSend(false)} />
      )}
    </View>
  );
}

function MetaStat({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.metaStat}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function SectionTitle({children}: {children: string}) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.dark2},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.dark, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#333',
  },
  backBtn: {padding: 4},
  backText: {color: COLORS.goldLight, fontSize: 16},
  headerTitle: {color: '#fff', fontSize: 15, fontWeight: '500'},
  deleteText: {color: COLORS.danger, fontSize: 14},
  scroll: {flex: 1},
  clientCard: {
    backgroundColor: COLORS.surface, margin: 16, marginBottom: 10,
    borderRadius: RADIUS.lg, padding: 16, flexDirection: 'row',
    alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: COLORS.border,
  },
  avatar: {width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 15, fontWeight: '500'},
  clientInfo: {flex: 1},
  clientName: {fontSize: 16, fontWeight: '500', color: COLORS.text},
  clientEmail: {fontSize: 12, color: COLORS.info, marginTop: 2},
  clientAddress: {fontSize: 12, color: COLORS.textMuted, marginTop: 2},
  statusBadge: {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  statusText: {fontSize: 11},
  metaRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 10,
  },
  metaStat: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 12, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center',
  },
  metaLabel: {fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5},
  metaValue: {fontSize: 13, fontWeight: '500', color: COLORS.text, marginTop: 4, textAlign: 'center'},
  sectionTitle: {
    fontSize: 12, fontWeight: '500', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: 16, marginTop: 12, marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16,
    borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border,
    paddingHorizontal: 14,
  },
  divRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  divRowLast: {borderBottomWidth: 0},
  divLabel: {fontSize: 13, color: COLORS.textMuted, flex: 1, marginRight: 8},
  divAmount: {fontSize: 13, fontWeight: '500', color: COLORS.text},
  pricingCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 10,
    borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, padding: 14,
  },
  pricingRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6},
  pricingLabel: {fontSize: 13, color: COLORS.textMuted},
  pricingVal: {fontSize: 13, fontWeight: '500', color: COLORS.text},
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 12, marginTop: 8, borderTopWidth: 1.5, borderTopColor: COLORS.dark,
  },
  totalLabel: {fontSize: 16, fontWeight: '500', color: COLORS.text},
  totalVal: {fontSize: 20, fontWeight: '500', color: COLORS.gold},
  notesText: {fontSize: 13, color: COLORS.textMuted, lineHeight: 20},
  actions: {padding: 16, gap: 10},
  btnGold: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    padding: 14, alignItems: 'center',
  },
  btnGoldText: {fontSize: 15, fontWeight: '500', color: '#fff'},
  btnGhost: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border,
  },
  btnGhostText: {fontSize: 15, fontWeight: '500', color: COLORS.text},
});
