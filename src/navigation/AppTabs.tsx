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

interface TabIconProps {
  focused: boolean;
  icon: React.ComponentType<any>;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon: Icon }) => (
  <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
    <Icon
      color={focused ? '#000000' : colors.textMuted}
      size={22}
      strokeWidth={focused ? 2.5 : 1.8}
    />
  </View>
);

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
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Home} />
          ),
        }}
      />

      <Tab.Screen
        name="CameraTab"
        component={SnapCameraScreen}
        options={{
          tabBarLabel: 'Snap',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Camera} />
          ),
        }}
      />

      <Tab.Screen
        name="ExpenseTab"
        component={ExpenseDashboardScreen}
        options={{
          tabBarLabel: 'Chi tiêu',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Wallet} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={User} />
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
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tabIconWrapper: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapperActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
});
