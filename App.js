import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    async function configureAndroidNavigationBar() {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setPositionAsync('absolute');
          await NavigationBar.setBackgroundColorAsync('#00000000');
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        } catch (error) {
          console.warn('Erro ao configurar barra de navegação do Android:', error);
        }
      }
    }

    configureAndroidNavigationBar();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}