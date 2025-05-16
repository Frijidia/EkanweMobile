import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types/navigation';

// Pages de connexion
import { SplashScreen } from '../screens/SplashScreen';
import { ConnectionScreen } from '../screens/LoginPages/ConnectionScreen';
import { WelcomeInfluenceurScreen } from '../screens/EkanwePages/WelcomeInfluenceurScreen';
import { WelcomeCommercantScreen } from '../screens/EkanwePages/WelcomeCommercantScreen';
import { CreatorTypeInfluenceurScreen } from '../screens/EkanwePages/CreatorTypeInfluenceurScreen';
import { ConceptInfluenceurScreen } from '../screens/EkanwePages/ConceptInfluenceurScreen';
import { LoginOrConnect } from '../screens/LoginPages/LoginOrConnect';
import { LoginScreen } from '../screens/LoginPages/LoginScreen';
import { RegisterScreen } from '../screens/LoginPages/RegisterScreen';
import { ValidateInscription } from '../screens/LoginPages/ValidateInscriptionScreen';
import { RegistrationStepOneScreen } from '../screens/LoginPages/RegistrationStepOneScreen';
import { InterestStepScreen } from '../screens/LoginPages/InterestStepScreen';
import { SocialConnectScreen } from '../screens/LoginPages/SocialConnectScreen';
import { PortfolioStepScreen } from '../screens/LoginPages/PortfolioStepScreen';
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
      <Stack.Screen name="WelcomeInfluenceur" component={WelcomeInfluenceurScreen} />
      <Stack.Screen name="WelcomeCommercant" component={WelcomeCommercantScreen} />
      <Stack.Screen name="CreatorTypeInfluenceur" component={CreatorTypeInfluenceurScreen} />
      <Stack.Screen name="ConceptInfluenceur" component={ConceptInfluenceurScreen} />
      <Stack.Screen name="LoginOrConnect" component={LoginOrConnect} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ValidateInscription" component={ValidateInscription} />
      <Stack.Screen name="RegistrationStepOne" component={RegistrationStepOneScreen} />
      <Stack.Screen name="InterestStep" component={InterestStepScreen} />
      <Stack.Screen name="SocialConnect" component={SocialConnectScreen} />
      <Stack.Screen name="PortfolioStep" component={PortfolioStepScreen} />
    </Stack.Navigator>
  );
}; 