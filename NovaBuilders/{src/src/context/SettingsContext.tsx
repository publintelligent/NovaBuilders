import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  companyName: string;
  pmName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  serviceArea: string;
  defaultOverheadPct: number;
  defaultProfitPct: number;
  bidValidDays: number;
  notifyOnOpen: boolean;
  notifyExpiry: boolean;
  weeklySummary: boolean;
  includeLogo: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  companyName: 'Nova Builders',
  pmName: 'Isai Tapia',
  email: 'novabuilders@yahoo.com',
  phone: '801-918-1236',
  licenseNumber: '14271957-5501',
  serviceArea: 'Utah Area',
  defaultOverheadPct: 12,
  defaultProfitPct: 15,
  bidValidDays: 30,
  notifyOnOpen: true,
  notifyExpiry: true,
  weeklySummary: false,
  includeLogo: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
const STORAGE_KEY = '@nova_settings';

export function SettingsProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setSettings({...DEFAULT_SETTINGS, ...JSON.parse(raw)});
    });
  }, []);

  async function updateSettings(updates: Partial<Settings>) {
    const updated = {...settings, ...updates};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSettings(updated);
  }

  return (
    <SettingsContext.Provider value={{settings, updateSettings}}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
