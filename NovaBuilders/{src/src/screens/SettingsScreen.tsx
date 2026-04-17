import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Switch, Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSettings} from '../context/SettingsContext';
import {COLORS, RADIUS} from '../utils/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {settings, updateSettings} = useSettings();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <Image
            source={require('../../assets/images/icon_xhdpi.png')}
            style={styles.profileLogo}
            resizeMode="contain"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{settings.pmName}</Text>
            <Text style={styles.profileRole}>Project Manager · {settings.serviceArea}</Text>
            <Text style={styles.profileEmail}>{settings.email}</Text>
          </View>
        </View>

        <SectionLabel>Company</SectionLabel>
        <View style={styles.card}>
          <SettingsRow label="Company name">
            <TextInput
              style={styles.settingInput}
              value={settings.companyName}
              onChangeText={v => updateSettings({companyName: v})}
            />
          </SettingsRow>
          <SettingsRow label="PM name">
            <TextInput
              style={styles.settingInput}
              value={settings.pmName}
              onChangeText={v => updateSettings({pmName: v})}
            />
          </SettingsRow>
          <SettingsRow label="License number">
            <TextInput
              style={styles.settingInput}
              value={settings.licenseNumber}
              onChangeText={v => updateSettings({licenseNumber: v})}
            />
          </SettingsRow>
          <SettingsRow label="Phone">
            <TextInput
              style={styles.settingInput}
              value={settings.phone}
              onChangeText={v => updateSettings({phone: v})}
              keyboardType="phone-pad"
            />
          </SettingsRow>
          <SettingsRow label="Email">
            <TextInput
              style={styles.settingInput}
              value={settings.email}
              onChangeText={v => updateSettings({email: v})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </SettingsRow>
          <SettingsRow label="Service area" last>
            <TextInput
              style={styles.settingInput}
              value={settings.serviceArea}
              onChangeText={v => updateSettings({serviceArea: v})}
            />
          </SettingsRow>
        </View>

        <SectionLabel>Default Pricing</SectionLabel>
        <View style={styles.card}>
          <SettingsRow label="Overhead %">
            <View style={styles.pctWrap}>
              <TextInput
                style={styles.pctInput}
                value={settings.defaultOverheadPct.toString()}
                onChangeText={v => updateSettings({defaultOverheadPct: parseFloat(v) || 0})}
                keyboardType="numeric"
              />
              <Text style={styles.pctSign}>%</Text>
            </View>
          </SettingsRow>
          <SettingsRow label="Profit %" last>
            <View style={styles.pctWrap}>
              <TextInput
                style={styles.pctInput}
                value={settings.defaultProfitPct.toString()}
                onChangeText={v => updateSettings({defaultProfitPct: parseFloat(v) || 0})}
                keyboardType="numeric"
              />
              <Text style={styles.pctSign}>%</Text>
            </View>
          </SettingsRow>
        </View>

        <SectionLabel>Bid Defaults</SectionLabel>
        <View style={styles.card}>
          <SettingsRow label="Valid for (days)">
            <TextInput
              style={styles.settingInput}
              value={settings.bidValidDays.toString()}
              onChangeText={v => updateSettings({bidValidDays: parseInt(v) || 30})}
              keyboardType="numeric"
            />
          </SettingsRow>
          <SettingsRow label="Include logo on PDF" last>
            <Switch
              value={settings.includeLogo}
              onValueChange={v => updateSettings({includeLogo: v})}
              trackColor={{false: '#333', true: COLORS.gold}}
              thumbColor="#fff"
            />
          </SettingsRow>
        </View>

        <SectionLabel>Notifications</SectionLabel>
        <View style={styles.card}>
          <SettingsRow label="Email when client opens bid">
            <Switch
              value={settings.notifyOnOpen}
              onValueChange={v => updateSettings({notifyOnOpen: v})}
              trackColor={{false: '#333', true: COLORS.gold}}
              thumbColor="#fff"
            />
          </SettingsRow>
          <SettingsRow label="Bid expiry reminders">
            <Switch
              value={settings.notifyExpiry}
              onValueChange={v => updateSettings({notifyExpiry: v})}
              trackColor={{false: '#333', true: COLORS.gold}}
              thumbColor="#fff"
            />
          </SettingsRow>
          <SettingsRow label="Weekly summary" last>
            <Switch
              value={settings.weeklySummary}
              onValueChange={v => updateSettings({weeklySummary: v})}
              trackColor={{false: '#333', true: COLORS.gold}}
              thumbColor="#fff"
            />
          </SettingsRow>
        </View>

        <View style={styles.versionWrap}>
          <Text style={styles.versionText}>Nova Builders Estimator Pro v1.0.0</Text>
          <Text style={styles.versionText}>Lic. {settings.licenseNumber}</Text>
        </View>

        <View style={{height: 32}} />
      </ScrollView>
    </View>
  );
}

function SectionLabel({children}: {children: string}) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function SettingsRow({
  label, children, last,
}: {label: string; children: React.ReactNode; last?: boolean}) {
  return (
    <View style={[styles.settingsRow, last && styles.settingsRowLast]}>
      <Text style={styles.settingsLabel}>{label}</Text>
      {children}
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
  scroll: {flex: 1},
  profileCard: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  profileLogo: {width: 52, height: 52, borderRadius: 12},
  profileInfo: {flex: 1},
  profileName: {fontSize: 16, fontWeight: '500', color: COLORS.text},
  profileRole: {fontSize: 12, color: COLORS.textMuted, marginTop: 2},
  profileEmail: {fontSize: 12, color: COLORS.info, marginTop: 2},
  sectionLabel: {
    fontSize: 12, fontWeight: '500', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: 16, marginTop: 16, marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16,
    borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  settingsRowLast: {borderBottomWidth: 0},
  settingsLabel: {fontSize: 14, color: COLORS.text, flex: 1},
  settingInput: {
    fontSize: 13, color: COLORS.textMuted, textAlign: 'right',
    minWidth: 80, padding: 0,
  },
  pctWrap: {flexDirection: 'row', alignItems: 'center', gap: 4},
  pctInput: {
    width: 50, borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 8,
    padding: 6, textAlign: 'center', fontSize: 13, color: COLORS.text,
    backgroundColor: COLORS.surface2,
  },
  pctSign: {fontSize: 13, color: COLORS.textMuted},
  versionWrap: {alignItems: 'center', marginTop: 24, gap: 4},
  versionText: {fontSize: 11, color: COLORS.textLight},
});
