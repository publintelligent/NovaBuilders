import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import {BidsProvider} from './src/context/BidsContext';
import {SettingsProvider} from './src/context/SettingsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <BidsProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
            <AppNavigator />
          </NavigationContainer>
          <Toast />
        </BidsProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
