import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomePlaceholder from '../screens/HomePlaceholder';

const Tab = createBottomTabNavigator();

const ParentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarActiveTintColor: '#2F6FED',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePlaceholder}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Child"
        component={HomePlaceholder}
        options={{
          tabBarLabel: 'My Child',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👶</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Payments"
        component={HomePlaceholder}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💳</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={HomePlaceholder}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ParentTabs;