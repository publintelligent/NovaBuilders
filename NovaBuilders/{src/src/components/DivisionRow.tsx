import React from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {Division} from '../utils/types';
import {formatCurrency} from '../utils/calculations';
import {COLORS, RADIUS} from '../utils/theme';

interface Props {
  division: Division;
  onToggle: (id: string) => void;
  onCostChange?: (id: string, value: string) => void;
  editable?: boolean;
  compact?: boolean;
}

export default function DivisionRow({
  division,
  onToggle,
  onCostChange,
  editable = true,
  compact = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        division.included && styles.rowActive,
        compact && styles.rowCompact,
      ]}
      onPress={() => editable && onToggle(division.id)}
      activeOpacity={editable ? 0.7 : 1}>

      {editable && (
        <View style={[styles.check, division.included && styles.checkActive]}>
          {division.included && (
            <Text style={styles.checkMark}>✓</Text>
          )}
        </View>
      )}

      <Text
        style={[
          styles.label,
          division.included && styles.labelActive,
          compact && styles.labelCompact,
        ]}
        numberOfLines={1}>
        {division.label}
      </Text>

      {division.included && onCostChange ? (
        <TextInput
          style={styles.costInput}
          value={division.directCost > 0 ? division.directCost.toString() : ''}
          onChangeText={v => onCostChange(division.id, v)}
          keyboardType="numeric"
          placeholder="$0"
          placeholderTextColor={COLORS.textMuted}
          onPress={e => e.stopPropagation?.()}
        />
      ) : (
        division.included && (
          <Text style={styles.costText}>
            {formatCurrency(division.directCost)}
          </Text>
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  rowActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  rowCompact: {padding: 9, marginBottom: 4},
  check: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkMark: {color: '#fff', fontSize: 10, fontWeight: '700'},
  label: {flex: 1, fontSize: 13, color: COLORS.textMuted},
  labelActive: {color: COLORS.text, fontWeight: '500'},
  labelCompact: {fontSize: 12},
  costInput: {
    width: 90,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 6,
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'right',
    backgroundColor: COLORS.surface,
  },
  costText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    flexShrink: 0,
  },
});
