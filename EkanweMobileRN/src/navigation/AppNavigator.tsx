import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/LoginScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { ConnectionScreen } from '../screens/ConnectionScreen';
import { WelcomeInfluenceurScreen } from '../screens/WelcomeInfluenceurScreen';

// Nous importerons les autres écrans au fur et à mesure
// import { RegisterScreen } from '../screens/RegisterScreen';
// etc...

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Navigation pour les commerçants
const CommercantStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DealsCommercant" component={LoginScreen} /> {/* Temporairement LoginScreen */}
      {/* Nous ajouterons les autres écrans commerçants ici */}
    </Stack.Navigator>
  );
};

// Navigation pour les influenceurs
const InfluenceurStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DealsInfluenceur" component={LoginScreen} /> {/* Temporairement LoginScreen */}
      {/* Nous ajouterons les autres écrans influenceurs ici */}
    </Stack.Navigator>
  );
};

// Navigation principale de l'application
export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Connection" component={ConnectionScreen} />
      <Stack.Screen name="WelcomeInfluenceur" component={WelcomeInfluenceurScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* Nous ajouterons les autres écrans d'authentification ici */}
    </Stack.Navigator>
  );
}; 