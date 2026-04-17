import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import NewBidScreen from '../screens/NewBidScreen';
import MyBidsScreen from '../screens/MyBidsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BidDetailScreen from '../screens/BidDetailScreen';
import {COLORS} from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({name, focused}: {name: string; focused: boolean}) {
  const icons: Record<string, string> = {
    Home: '⌂',
    'New Bid': '+',
    'My Bids': '☰',
    Settings: '⚙',
  };
  return (
    <View style={styles.tabIconWrap}>
      <Text style={[styles.tabIconText, focused && styles.tabIconActive]}>
        {icons[name]}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {name}
      </Text>
    </View>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#333',
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="New Bid"
        component={NewBidScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="New Bid" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="My Bids"
        component={MyBidsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="My Bids" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="Settings" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="BidDetail"
        component={BidDetailScreen}
        options={{presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {alignItems: 'center', gap: 3, paddingTop: 8},
  tabIconText: {fontSize: 20, color: '#555'},
  tabIconActive: {color: COLORS.goldLight},
  tabLabel: {fontSize: 10, color: '#555'},
  tabLabelActive: {color: COLORS.goldLight},
});
