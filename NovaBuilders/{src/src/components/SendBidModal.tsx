import React, {useState} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Linking, Share,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useBids} from '../context/BidsContext';
import {COLORS, RADIUS} from '../utils/theme';
import {formatCurrency} from '../utils/calculations';
import {generateBidEmail} from '../services/claudeService';

interface Props {
  bidId: string;
  onClose: () => void;
}

export default function SendBidModal({bidId, onClose}: Props) {
  const insets = useSafeAreaInsets();
  const {getBid, updateBid} = useBids();
  const [sending, setSending] = useState(false);
  const bid = getBid(bidId);

  if (!bid) return null;

  async function sendEmail() {
    setSending(true);
    try {
      const body = await generateBidEmail({
        clientName: bid!.clientName,
        projectAddress: bid!.projectAddress,
        projectType: bid!.projectType,
        grandTotal: bid!.grandTotal,
        bidNumber: bid!.bidNumber,
      });

      const subject = encodeURIComponent(
        `Nova Builders – Bid Proposal ${bid!.bidNumber} – ${bid!.projectType}`,
      );
      const bodyEncoded = encodeURIComponent(body);
      const mailto = `mailto:${bid!.clientEmail}?subject=${subject}&body=${bodyEncoded}`;

      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
        await updateBid(bid!.id, {status: 'sent', sentAt: new Date().toISOString()});
        Toast.show({type: 'success', text1: 'Email opened!', text2: 'Bid marked as sent.'});
        onClose();
      } else {
        Toast.show({type: 'error', text1: 'No email app found'});
      }
    } catch {
      Toast.show({type: 'error', text1: 'Failed to generate email'});
    } finally {
      setSending(false);
    }
  }

  async function shareViaWhatsApp() {
    const msg = `Hi ${bid!.clientName}! I've prepared a bid proposal for your ${bid!.projectType} project at ${bid!.projectAddress}.\n\nBid #: ${bid!.bidNumber}\nTotal: ${formatCurrency(bid!.grandTotal)}\n\nPlease review and let me know if you have any questions.\n\n— Isai Tapia, Nova Builders\n📞 801-918-1236`;
    const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      await updateBid(bid!.id, {status: 'sent', sentAt: new Date().toISOString()});
      onClose();
    } else {
      Toast.show({type: 'error', text1: 'WhatsApp not installed'});
    }
  }

  async function shareFile() {
    await Share.share({
      message: `Nova Builders Bid ${bid!.bidNumber} — ${bid!.clientName} — ${formatCurrency(bid!.grandTotal)}`,
      title: `Bid ${bid!.bidNumber}`,
    });
    await updateBid(bid!.id, {status: 'sent', sentAt: new Date().toISOString()});
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, {paddingBottom: insets.bottom || 20}]}>
          <View style={styles.handle} />

          <Text style={styles.title}>Send bid</Text>
          <Text style={styles.sub}>Choose how to deliver this proposal</Text>

          {/* Client summary */}
          <View style={styles.summaryCard}>
            <Row label="Client" value={bid.clientName} />
            <Row label="Email" value={bid.clientEmail || '—'} color={COLORS.info} />
            <Row label="Project" value={bid.projectType} />
            <Row label="Total" value={formatCurrency(bid.grandTotal)} color={COLORS.gold} />
          </View>

          <View style={styles.options}>
            <SendOption
              icon="📧"
              title={sending ? 'Generating...' : 'Email client PDF'}
              desc="Professional bid opened in your mail app"
              primary
              onPress={sendEmail}
              disabled={sending}
            />
            <SendOption
              icon="💬"
              title="Send via WhatsApp"
              desc="Share bid summary through WhatsApp"
              onPress={shareViaWhatsApp}
            />
            <SendOption
              icon="📤"
              title="Share / Download"
              desc="Use your phone's share sheet"
              onPress={shareFile}
            />
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Row({label, value, color}: {label: string; value: string; color?: string}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, color ? {color} : {}]}>{value}</Text>
    </View>
  );
}

function SendOption({
  icon, title, desc, primary, onPress, disabled,
}: {
  icon: string; title: string; desc: string;
  primary?: boolean; onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, primary && styles.optionPrimary]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <Text style={styles.optionIcon}>{icon}</Text>
      <View style={styles.optionInfo}>
        <Text style={[styles.optionTitle, primary && styles.optionTitleWhite]}>{title}</Text>
        <Text style={[styles.optionDesc, primary && styles.optionDescLight]}>{desc}</Text>
      </View>
      <Text style={[styles.chevron, primary && {color: '#aaa'}]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20,
  },
  handle: {
    width: 36, height: 4, backgroundColor: COLORS.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  title: {fontSize: 20, fontWeight: '500', color: COLORS.text, marginBottom: 4},
  sub: {fontSize: 13, color: COLORS.textMuted, marginBottom: 16},
  summaryCard: {
    backgroundColor: COLORS.surface2, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 16, borderWidth: 0.5, borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  rowLabel: {fontSize: 13, color: COLORS.textMuted},
  rowValue: {fontSize: 13, fontWeight: '500', color: COLORS.text},
  options: {gap: 10, marginBottom: 14},
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface2, borderRadius: RADIUS.md,
    padding: 14, borderWidth: 0.5, borderColor: COLORS.border,
  },
  optionPrimary: {backgroundColor: COLORS.dark, borderColor: COLORS.dark},
  optionIcon: {fontSize: 20},
  optionInfo: {flex: 1},
  optionTitle: {fontSize: 14, fontWeight: '500', color: COLORS.text},
  optionTitleWhite: {color: '#fff'},
  optionDesc: {fontSize: 11, color: COLORS.textMuted, marginTop: 2},
  optionDescLight: {color: '#888'},
  chevron: {fontSize: 20, color: '#999'},
  cancelBtn: {
    padding: 13, alignItems: 'center', borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface2, borderWidth: 0.5, borderColor: COLORS.border,
  },
  cancelText: {fontSize: 14, color: COLORS.textMuted},
});
