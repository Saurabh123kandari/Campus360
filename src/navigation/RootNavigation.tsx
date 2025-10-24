import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomePlaceholder from '../screens/HomePlaceholder';
import ParentTabs from './ParentTabs';
import TeacherTabs from './TeacherTabs';
import AdminTabs from './AdminTabs';

const RootNavigation = () => {
  const { user, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  // Reset to login screen when user logs out
  React.useEffect(() => {
    if (!user) {
      setCurrentScreen('login');
    }
  }, [user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6FED" />
      </View>
    );
  }

  // Show appropriate screen based on user role
  if (user) {
    console.debug('🎯 User authenticated:', user);
    console.debug('🎯 User role:', user.role);
    if (user.role === 'parent') {
      console.debug('🎯 Showing ParentTabs for parent user');
      return <ParentTabs />;
    } else if (user.role === 'teacher') {
      console.debug('🎯 Showing TeacherTabs for teacher user');
      return <TeacherTabs />;
    } else if (user.role === 'schoolOwner') {
      console.debug('🎯 Showing AdminTabs for schoolOwner user');
      return <AdminTabs />;
    } else {
      console.debug('🎯 Showing HomePlaceholder for other user role');
      return <HomePlaceholder />;
    }
  }

  // Show login or register screen based on current state
  if (currentScreen === 'login') {
    return <LoginScreen onNavigateToRegister={() => setCurrentScreen('register')} />;
  } else {
    return <RegisterScreen onNavigateToLogin={() => setCurrentScreen('login')} />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default RootNavigation;