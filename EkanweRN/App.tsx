import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from './src/screens/SplashScreen';
import { ConnectionScreen } from './src/screens/LoginPages/ConnectionScreen';
import { WelcomeInfluenceurScreen } from './src/screens/EkanwePages/WelcomeInfluenceurScreen';
import { WelcomeCommercantScreen } from './src/screens/EkanwePages/WelcomeCommercantScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CreatorTypeInfluenceurScreen } from './src/screens/EkanwePages/CreatorTypeInfluenceurScreen';
import { ConceptInfluenceurScreen } from './src/screens/EkanwePages/ConceptInfluenceurScreen';
import { LoginOrConnectScreen } from './src/screens/LoginPages/LoginOrConnectScreen';
import { LoginScreen } from './src/screens/LoginPages/LoginScreen';
import { RegisterScreen } from './src/screens/LoginPages/RegisterScreen';
import { ValidateInscriptionScreen } from './src/screens/LoginPages/ValidateInscriptionScreen';
import { RegistrationStepOneScreen } from './src/screens/LoginPages/RegistrationStepOneScreen';
import { InterestStepScreen } from './src/screens/LoginPages/InterestStepScreen';
import { SocialConnectScreen } from './src/screens/LoginPages/SocialConnectScreen';
import { PortfolioStepScreen } from './src/screens/LoginPages/PortfolioStepScreen';
import { RegistrationCompleteScreen } from './src/screens/LoginPages/RegistrationCompleteScreen';
import { DealsInfluenceurScreen } from './src/screens/InfluenceurPages/DealsInfluenceurScreen';
import { SuivisDealsInfluenceurScreen } from './src/screens/InfluenceurPages/SuivisDealsInfluenceurScreen';
import { DiscussionInfluenceurScreen } from './src/screens/InfluenceurPages/DiscussionInfluenceurScreen';
import { SaveDealsInfluenceurScreen } from './src/screens/InfluenceurPages/SaveDealsInfluenceurScreen';
import { ProfileInfluenceurScreen } from './src/screens/InfluenceurPages/ProfileInfluenceurScreen';
//import { ChatInfluenceurScreen } from './src/screens/InfluenceurPages/ChatInfluenceurScreen';
import { DealDetailsInfluenceurScreen } from './src/screens/InfluenceurPages/DealDetailsInfluenceurScreen';
import { DealsSeeMoreInfluenceurScreen } from './src/screens/InfluenceurPages/DealsSeeMoreInfluenceurScreen';
import { ConceptCommercantScreen } from './src/screens/EkanwePages/ConceptCommercantScreen';
import { CreatorCommercantScreen } from './src/screens/EkanwePages/CreatorCommercantScreen';
import { DealsPageCommercantScreen } from './src/screens/CommercantPages/DealsCommercantScreen';
import { ForgotPasswordScreen } from './src/screens/LoginPages/ForgotPasswordScreen';
import { configureStatusBar } from './src/utils/capacitorUtils';
import { UserProvider } from './src/context/UserContext';
import { DealsCreationScreen } from './src/screens/CommercantPages/DealsCreationScreen';
import { ProfileCommercantScreen } from './src/screens/CommercantPages/ProfileCommercantScreen';
import { SuiviDealsCommercantScreen } from './src/screens/CommercantPages/SuiviDealsCommercantScreen';
import { DiscussionCommercantScreen } from './src/screens/CommercantPages/DiscussionCommercantScreen';
import { DashboardCommercantScreen } from './src/screens/CommercantPages/DashboardCommercantScreen';
import { NotificationInfluenceurScreen } from './src/screens/InfluenceurPages/NotificationInfluenceurScreen';
import { DealsDetailsCommercantScreen } from './src/screens/CommercantPages/DealsDetailsCommercantScreen';
import { NotificationsCommercantScreen } from './src/screens/CommercantPages/NotificationsCommercantScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { RootStackParamList } from './src/types/navigation';
import { ReviewCommercantScreen } from './src/screens/CommercantPages/ReviewCommercantScreen';
import { ReviewInfluenceurScreen } from './src/screens/InfluenceurPages/ReviewInfluenceurScreen';
import { ProfilPublicScreen } from './src/screens/CommercantPages/ProfilPublicScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Connection" component={ConnectionScreen} />
          <Stack.Screen name="WelcomeInfluenceur" component={WelcomeInfluenceurScreen} />
          <Stack.Screen name="WelcomeCommercant" component={WelcomeCommercantScreen} />
          {/* <Stack.Screen name="App" component={AppNavigator} /> */}
          <Stack.Screen name="CreatorTypeInfluenceur" component={CreatorTypeInfluenceurScreen} />
          <Stack.Screen name="ConceptInfluenceur" component={ConceptInfluenceurScreen} />
          <Stack.Screen name="LoginOrConnect" component={LoginOrConnectScreen} />
          <Stack.Screen name='Login' component={LoginScreen} />
          <Stack.Screen name='Register' component={RegisterScreen} />
          <Stack.Screen name='ValidateInscription' component={ValidateInscriptionScreen} />
          <Stack.Screen name='RegistrationStepOne' component={RegistrationStepOneScreen} />
          <Stack.Screen name='InterestStep' component={InterestStepScreen} />
          <Stack.Screen name='SocialConnect' component={SocialConnectScreen} />
          <Stack.Screen name='PortfolioStep' component={PortfolioStepScreen} />
          <Stack.Screen name='RegistrationComplete' component={RegistrationCompleteScreen} />
          <Stack.Screen name='DealsInfluenceur' component={DealsInfluenceurScreen} />
          <Stack.Screen name='SuivisDealsInfluenceur' component={SuivisDealsInfluenceurScreen} />
          <Stack.Screen name='DiscussionInfluenceur' component={DiscussionInfluenceurScreen} />
          <Stack.Screen name='SaveDealsInfluenceur' component={SaveDealsInfluenceurScreen} />
          <Stack.Screen name='ProfileInfluenceur' component={ProfileInfluenceurScreen} />
          {/* <Stack.Screen name='ChatInfluenceur' component={ChatInfluenceurScreen} /> */}
          <Stack.Screen name='DealDetailsInfluenceur' component={DealDetailsInfluenceurScreen} />
          <Stack.Screen name='DealsSeeMoreInfluenceur' component={DealsSeeMoreInfluenceurScreen} />
          <Stack.Screen name='ConceptCommercant' component={ConceptCommercantScreen} />
          <Stack.Screen name='CreatorCommercant' component={CreatorCommercantScreen} />
          <Stack.Screen name='DealsCommercant' component={DealsPageCommercantScreen} />
          <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
          <Stack.Screen name='DealsCreation' component={DealsCreationScreen} />
          <Stack.Screen name='ProfileCommercant' component={ProfileCommercantScreen} />
          <Stack.Screen name='SuiviDealsCommercant' component={SuiviDealsCommercantScreen} />
          <Stack.Screen name='DiscussionCommercant' component={DiscussionCommercantScreen} />
          <Stack.Screen name='DashboardCommercant' component={DashboardCommercantScreen} />
          <Stack.Screen name='NotificationInfluenceur' component={NotificationInfluenceurScreen} />
          <Stack.Screen name='DealsDetailsCommercant' component={DealsDetailsCommercantScreen} />
          <Stack.Screen name='NotificationsCommercant' component={NotificationsCommercantScreen} />
          <Stack.Screen name='ReviewCommercant' component={ReviewCommercantScreen} />
          <Stack.Screen name='ReviewInfluenceur' component={ReviewInfluenceurScreen} />
          <Stack.Screen name='ProfilPublic' component={ProfilPublicScreen} />
          <Stack.Screen name='Chat' component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}