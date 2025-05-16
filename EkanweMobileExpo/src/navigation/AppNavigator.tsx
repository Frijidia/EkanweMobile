import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types/navigation';

// Pages de connexion
import { SplashScreen } from '../screens/SplashScreen';
import { ConnectionScreen } from '../screens/ConnectionScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Pages d'accueil
import { WelcomeInfluenceurScreen } from '../screens/WelcomeInfluenceurScreen';
import { WelcomeCommercantScreen } from '../screens/WelcomeCommercantScreen';

// Pages d'inscription
import { RegistrationStepOneScreen } from '../screens/RegistrationStepOneScreen';
import { InterestStepScreen } from '../screens/InterestStepScreen';
import { SocialConnectScreen } from '../screens/SocialConnectScreen';
import { PortfolioStepScreen } from '../screens/PortfolioStepScreen';

// Pages des influenceurs
import { DealsInfluenceurScreen } from '../screens/DealsInfluenceurScreen';
import { DealDetailsInfluenceurScreen } from '../screens/DealDetailsInfluenceurScreen';
import { DealsSeeMoreInfluenceurScreen } from '../screens/DealsSeeMoreInfluenceurScreen';
import { SaveDealsInfluenceurScreen } from '../screens/SaveDealsInfluenceurScreen';
import { SuivisDealsInfluenceurScreen } from '../screens/SuivisDealsInfluenceurScreen';
import { DiscussionInfluenceurScreen } from '../screens/DiscussionInfluenceurScreen';
import { ChatInfluenceurScreen } from '../screens/ChatInfluenceurScreen';
import { NotificationInfluenceurScreen } from '../screens/NotificationInfluenceurScreen';
import { ProfilInfluenceurScreen } from '../screens/ProfilInfluenceurScreen';
import { PostDetailsInfluenceurScreen } from '../screens/PostDetailsInfluenceurScreen';

// Pages des commerçants
import { DealsCommercantScreen } from '../screens/DealsCommercantScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Navigation pour les commerçants
const CommercantStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DealsCommercant" component={DealsCommercantScreen} />
    </Stack.Navigator>
  );
};

// Navigation pour les influenceurs
const InfluenceurStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DealsInfluenceur" component={DealsInfluenceurScreen} />
      <Stack.Screen name="DealDetailsInfluenceur" component={DealDetailsInfluenceurScreen} />
      <Stack.Screen name="DealsSeeMoreInfluenceur" component={DealsSeeMoreInfluenceurScreen} />
      <Stack.Screen name="SaveDealsInfluenceur" component={SaveDealsInfluenceurScreen} />
      <Stack.Screen name="SuivisDealsInfluenceur" component={SuivisDealsInfluenceurScreen} />
      <Stack.Screen name="DiscussionInfluenceur" component={DiscussionInfluenceurScreen} />
      <Stack.Screen name="ChatInfluenceur" component={ChatInfluenceurScreen} />
      <Stack.Screen name="NotificationInfluenceur" component={NotificationInfluenceurScreen} />
      <Stack.Screen name="ProfileInfluenceur" component={ProfilInfluenceurScreen} />
      <Stack.Screen name="PostDetailsInfluenceur" component={PostDetailsInfluenceurScreen} />
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
      {/* Pages de connexion */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Connection" component={ConnectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Pages d'accueil */}
      <Stack.Screen name="WelcomeInfluenceur" component={WelcomeInfluenceurScreen} />
      <Stack.Screen name="WelcomeCommercant" component={WelcomeCommercantScreen} />

      {/* Pages d'inscription */}
      <Stack.Screen name="RegistrationStepOne" component={RegistrationStepOneScreen} />
      <Stack.Screen name="InterestStep" component={InterestStepScreen} />
      <Stack.Screen name="SocialConnect" component={SocialConnectScreen} />
      <Stack.Screen name="PortfolioStep" component={PortfolioStepScreen} />

      {/* Pages principales */}
      <Stack.Screen name="DealsInfluenceur" component={DealsInfluenceurScreen} />
      <Stack.Screen name="DealsCommercant" component={DealsCommercantScreen} />
    </Stack.Navigator>
  );
}; 