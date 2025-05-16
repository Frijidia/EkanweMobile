import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types/navigation';

// Pages de connexion
import { SplashScreen } from '../screens/SplashScreen';
import { ConnectionScreen } from '../screens/ConnectionScreen';

// Navigation principale de l'application
const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Pages de connexion */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Connection" component={ConnectionScreen} />
    </Stack.Navigator>
  );
}; 