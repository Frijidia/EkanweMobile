import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../src/navigation/types';

// Import des écrans d'authentification
import Login from '../screens/auth/Login';
import Register from '../../EkanweMobileRN/src/screens/auth/Register';
import ForgotPassword from '../../EkanweMobileRN/src/screens/auth/ForgotPassword';
import InterestStep from '../../EkanweMobileRN/src/screens/auth/InterestStep';
import PortfolioStep from '../../EkanweMobileRN/src/screens/auth/PortfolioStep';
import RegistrationComplete from '../../EkanweMobileRN/src/screens/auth/RegistrationComplete';
import RegistrationStepOne from '../../EkanweMobileRN/src/screens/auth/RegistrationStepOne';
import SocialConnect from '../../EkanweMobileRN/src/screens/auth/SocialConnect';
import ValidateInscription from '../../EkanweMobileRN/src/screens/auth/ValidateInscription';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' }
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="InterestStep" component={InterestStep} />
      <Stack.Screen name="PortfolioStep" component={PortfolioStep} />
      <Stack.Screen name="RegistrationComplete" component={RegistrationComplete} />
      <Stack.Screen name="RegistrationStepOne" component={RegistrationStepOne} />
      <Stack.Screen name="SocialConnect" component={SocialConnect} />
      <Stack.Screen name="ValidateInscription" component={ValidateInscription} />
    </Stack.Navigator>
  );
} 