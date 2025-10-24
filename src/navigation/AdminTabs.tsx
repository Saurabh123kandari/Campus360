import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/admin/DashboardScreen';
import PaymentsScreen from '../screens/admin/PaymentsScreen';
import StatisticsScreen from '../screens/admin/StatisticsScreen';
import AcademicEventsScreen from '../screens/admin/AcademicEventsScreen';
import ProfileModal from '../screens/admin/ProfileModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AdminDashboard"
      component={DashboardScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="AdminProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Admin Profile' }}
    />
  </Stack.Navigator>
);

const PaymentsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AdminPayments"
      component={PaymentsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="AdminProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Admin Profile' }}
    />
  </Stack.Navigator>
);

const StatisticsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AdminStatistics"
      component={StatisticsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="AdminProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Admin Profile' }}
    />
  </Stack.Navigator>
);

const EventsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AdminEvents"
      component={AcademicEventsScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="AdminProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Admin Profile' }}
    />
  </Stack.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        height: 60,
        paddingBottom: 6,
      },
      tabBarActiveTintColor: '#2F6FED',
      tabBarInactiveTintColor: '#666',
      tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
    }}
  >
    <Tab.Screen
      name="AdminDashboardTab"
      component={DashboardStack}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
      }}
    />
    <Tab.Screen
      name="AdminPaymentsTab"
      component={PaymentsStack}
      options={{
        tabBarLabel: 'Payments',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💳</Text>,
      }}
    />
    <Tab.Screen
      name="AdminStatisticsTab"
      component={StatisticsStack}
      options={{
        tabBarLabel: 'Statistics',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text>,
      }}
    />
    <Tab.Screen
      name="AdminEventsTab"
      component={EventsStack}
      options={{
        tabBarLabel: 'Events',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
      }}
    />
  </Tab.Navigator>
);

export default AdminTabs;
