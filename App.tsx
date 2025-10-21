import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { DataProvider } from './src/providers/DataProvider';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import Toast from './src/components/Toast';
import RootNavigation from './src/navigation/RootNavigation';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <StatusBar barStyle="light-content" backgroundColor="#2F6FED" />
            <RootNavigation />
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </NavigationContainer>
  );
};

export default App;
