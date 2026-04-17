import React from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import {COLORS} from '../utils/theme';

interface Props {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export default function AppHeader({
  title,
  subtitle,
  showLogo = false,
  rightElement,
  onBack,
}: Props) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
      )}

      {showLogo && (
        <Image
          source={require('../../assets/images/icon_xhdpi.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      )}

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightElement ? (
        <View style={styles.right}>{rightElement}</View>
      ) : (
        <View style={styles.right} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dark,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    gap: 10,
  },
  backBtn: {paddingRight: 4},
  backText: {color: COLORS.goldLight, fontSize: 22, lineHeight: 24},
  logo: {width: 32, height: 32, borderRadius: 7},
  titleWrap: {flex: 1},
  title: {color: '#fff', fontSize: 17, fontWeight: '500'},
  subtitle: {color: '#888', fontSize: 11, marginTop: 1},
  right: {minWidth: 32},
});
