import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/teacher/DashboardScreen';
import AttendanceListScreen from '../screens/teacher/AttendanceListScreen';
import TakeAttendanceScreen from '../screens/teacher/TakeAttendanceScreen';
import AttendanceReportScreen from '../screens/teacher/AttendanceReportScreen';
import CalendarScreen from '../screens/teacher/CalendarScreen';
import TeacherChatDirectory from '../screens/teacher/TeacherChatDirectory';
import ChatThreadScreen from '../screens/chat/ChatThreadScreen';
import ProfileModal from '../screens/teacher/ProfileModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="TeacherDashboard"
      component={DashboardScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="ProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Profile' }}
    />
  </Stack.Navigator>
);

const AttendanceStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AttendanceList"
      component={AttendanceListScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="TakeAttendance"
      component={TakeAttendanceScreen}
      options={{ title: 'Take Attendance' }}
    />
    <Stack.Screen
      name="AttendanceReport"
      component={AttendanceReportScreen}
      options={{ title: 'Attendance Report' }}
    />
    <Stack.Screen
      name="ProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Profile' }}
    />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="TeacherCalendar"
      component={CalendarScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="ProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Profile' }}
    />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="TeacherChatDirectory"
      component={TeacherChatDirectory}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen name="ChatThread" component={ChatThreadScreen} options={{ title: 'Conversation' }} />
    <Stack.Screen
      name="ProfileModal"
      component={ProfileModal}
      options={{ presentation: 'modal', title: 'Profile' }}
    />
  </Stack.Navigator>
);

const TeacherTabs = () => (
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
      name="TeacherDashboardTab"
      component={DashboardStack}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏫</Text>,
      }}
    />
    <Tab.Screen
      name="TeacherAttendanceTab"
      component={AttendanceStack}
      options={{
        tabBarLabel: 'Attendance',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✅</Text>,
      }}
    />
    <Tab.Screen
      name="TeacherCalendarTab"
      component={CalendarStack}
      options={{
        tabBarLabel: 'Calendar',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
      }}
    />
    <Tab.Screen
      name="TeacherChatTab"
      component={ChatStack}
      options={{
        tabBarLabel: 'Chat',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
      }}
    />
  </Tab.Navigator>
);

export default TeacherTabs;


