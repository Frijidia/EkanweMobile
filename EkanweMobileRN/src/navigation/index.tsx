import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../../src/navigation/types';

// Import des stacks de navigation
import AuthStack from './AuthStack';
import MerchantStack from './MerchantStack';
import InfluencerStack from './InfluencerStack';
import EkanweStack from './EkanweStack';

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  // Ici, nous ajouterons plus tard la logique pour déterminer si l'utilisateur est connecté
  const isAuthenticated = false;
  const userType = 'merchant'; // 'merchant', 'influencer', ou 'ekanwe'

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={
            userType === 'merchant' ? MerchantStack :
            userType === 'influencer' ? InfluencerStack :
            EkanweStack
          } />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 