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
import { LoginOrConnectScreen } from '../screens/LoginPages/LoginOrConnectScreen';
import { LoginScreen } from '../screens/LoginPages/LoginScreen';
import { RegisterScreen } from '../screens/LoginPages/RegisterScreen';
import { ValidateInscriptionScreen } from '../screens/LoginPages/ValidateInscriptionScreen';
import { RegistrationStepOneScreen } from '../screens/LoginPages/RegistrationStepOneScreen';
import { InterestStepScreen } from '../screens/LoginPages/InterestStepScreen';
import { SocialConnectScreen } from '../screens/LoginPages/SocialConnectScreen';
import { PortfolioStepScreen } from '../screens/LoginPages/PortfolioStepScreen';
import { RegistrationCompleteScreen } from '../screens/LoginPages/RegistrationCompleteScreen';
import { DealsInfluenceurScreen } from '../screens/InfluenceurPages/DealsInfluenceurScreen';
import { SuivisDealsInfluenceurScreen } from '../screens/InfluenceurPages/SuivisDealsInfluenceurScreen';
import { DiscussionInfluenceurScreen } from '../screens/InfluenceurPages/DiscussionInfluenceurScreen';
import { SaveDealsInfluenceurScreen } from '../screens/InfluenceurPages/SaveDealsInfluenceurScreen';
import { ProfileInfluenceurScreen } from '../screens/InfluenceurPages/ProfileInfluenceurScreen';
//import { ChatInfluenceurScreen } from '../screens/InfluenceurPages/ChatInfluenceurScreen'; 
import { DealDetailsInfluenceurScreen } from '../screens/InfluenceurPages/DealDetailsInfluenceurScreen';
import { DealsSeeMoreInfluenceurScreen } from '../screens/InfluenceurPages/DealsSeeMoreInfluenceurScreen';
import { ConceptCommercantScreen } from '../screens/EkanwePages/ConceptCommercantScreen';
import { CreatorCommercantScreen } from '../screens/EkanwePages/CreatorCommercantScreen';
import { DealsPageCommercantScreen } from '../screens/CommercantPages/DealsCommercantScreen';
import { ForgotPasswordScreen } from '../screens/LoginPages/ForgotPasswordScreen';
import { DealsCreationScreen } from '../screens/CommercantPages/DealsCreationScreen';
import { ProfileCommercantScreen } from '../screens/CommercantPages/ProfileCommercantScreen';
import { SuiviDealsCommercantScreen } from '../screens/CommercantPages/SuiviDealsCommercantScreen';
import { DiscussionCommercantScreen } from '../screens/CommercantPages/DiscussionCommercantScreen';
import { DashboardCommercantScreen } from '../screens/CommercantPages/DashboardCommercantScreen';
import { NotificationInfluenceurScreen } from '../screens/InfluenceurPages/NotificationInfluenceurScreen';
import { DealsDetailsCommercantScreen } from '../screens/CommercantPages/DealsDetailsCommercantScreen';
import { NotificationsCommercantScreen } from '../screens/CommercantPages/NotificationsCommercantScreen';
import { ChatScreen } from '../screens/ChatScreen';
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
      <Stack.Screen name="LoginOrConnect" component={LoginOrConnectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ValidateInscription" component={ValidateInscriptionScreen} />
      <Stack.Screen name="RegistrationStepOne" component={RegistrationStepOneScreen} />
      <Stack.Screen name="InterestStep" component={InterestStepScreen} />
      <Stack.Screen name="SocialConnect" component={SocialConnectScreen} />
      <Stack.Screen name="PortfolioStep" component={PortfolioStepScreen} />
      <Stack.Screen name="RegistrationComplete" component={RegistrationCompleteScreen} />
      <Stack.Screen name="DealsInfluenceur" component={DealsInfluenceurScreen} />
      <Stack.Screen name="SuivisDealsInfluenceur" component={SuivisDealsInfluenceurScreen} />
      <Stack.Screen name="DiscussionInfluenceur" component={DiscussionInfluenceurScreen} />
      <Stack.Screen name="SaveDealsInfluenceur" component={SaveDealsInfluenceurScreen} />
      <Stack.Screen name="ProfileInfluenceur" component={ProfileInfluenceurScreen} />
      {/* <Stack.Screen name="ChatInfluenceur" component={ChatInfluenceurScreen} /> */}
      <Stack.Screen name="DealDetailsInfluenceur" component={DealDetailsInfluenceurScreen} />
      <Stack.Screen name="DealsSeeMoreInfluenceur" component={DealsSeeMoreInfluenceurScreen} />
      <Stack.Screen name="ConceptCommercant" component={ConceptCommercantScreen} />
      <Stack.Screen name="CreatorCommercant" component={CreatorCommercantScreen} />
      <Stack.Screen name="DealsCommercant" component={DealsPageCommercantScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="DealsCreation" component={DealsCreationScreen} />
      <Stack.Screen name="ProfileCommercant" component={ProfileCommercantScreen} />
      <Stack.Screen name="SuiviDealsCommercant" component={SuiviDealsCommercantScreen} />
      <Stack.Screen name="DiscussionCommercant" component={DiscussionCommercantScreen} />
      <Stack.Screen name="DashboardCommercant" component={DashboardCommercantScreen} />
      <Stack.Screen name="NotificationInfluenceur" component={NotificationInfluenceurScreen} />
      <Stack.Screen name="DealsDetailsCommercant" component={DealsDetailsCommercantScreen} />
      <Stack.Screen name="NotificationsCommercant" component={NotificationsCommercantScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}; 