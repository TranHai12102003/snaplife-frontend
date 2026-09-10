import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Camera, Wallet, User } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { SnapCameraScreen } from '../screens/camera/SnapCameraScreen';
import { ExpenseDashboardScreen } from '../screens/expense/ExpenseDashboardScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

export type AppTabsParamList = {
  FeedTab: undefined;
  CameraTab: undefined;
  ExpenseTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Bảng tin',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />

      <Tab.Screen
        name="CameraTab"
        component={SnapCameraScreen}
        options={{
          tabBarLabel: 'Snap',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerSnapButton}>
              <Camera color="#000000" size={24} strokeWidth={2.2} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ExpenseTab"
        component={ExpenseDashboardScreen}
        options={{
          tabBarLabel: 'Chi tiêu',
          tabBarIcon: ({ color, focused }) => (
            <Wallet color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerSnapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});

