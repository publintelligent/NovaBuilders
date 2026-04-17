import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, RADIUS} from '../utils/theme';

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export default function StatCard({label, value, sub, accent}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? {color: accent} : {}]}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 6,
    textAlign: 'center',
  },
  sub: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 3,
    textAlign: 'center',
  },
});
