import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from './src/screens/SplashScreen';
import { ConnectionScreen } from './src/screens/LoginPages/ConnectionScreen';
import { WelcomeInfluenceurScreen } from './src/screens/EkanwePages/WelcomeInfluenceurScreen';
import { WelcomeCommercantScreen } from './src/screens/EkanwePages/WelcomeCommercantScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CreatorTypeInfluenceurScreen } from './src/screens/EkanwePages/CreatorTypeInfluenceurScreen';
import { ConceptInfluenceurScreen } from './src/screens/EkanwePages/ConceptInfluenceurScreen';
import { LoginOrConnect } from './src/screens/LoginPages/LoginOrConnect';
import { LoginScreen } from './src/screens/LoginPages/LoginScreen';
import { RegisterScreen } from './src/screens/LoginPages/RegisterScreen';
import { ValidateInscription } from './src/screens/LoginPages/ValidateInscriptionScreen';
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
import { ChatInfluenceurScreen } from './src/screens/InfluenceurPages/ChatInfluenceurScreen';
import { DealDetailsInfluenceurScreen } from './src/screens/InfluenceurPages/DealDetailsInfluenceurScreen';
import { DealsSeeMoreInfluenceurScreen } from './src/screens/InfluenceurPages/DealsSeeMoreInfluenceurScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
        <Stack.Screen name="App" component={AppNavigator} />
        <Stack.Screen name="CreatorTypeInfluenceur" component={CreatorTypeInfluenceurScreen} />
        <Stack.Screen name="ConceptInfluenceur" component={ConceptInfluenceurScreen} />
        <Stack.Screen name="LoginOrConnect" component={LoginOrConnect} />
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Register' component={RegisterScreen} />
        <Stack.Screen name='ValidateInscription' component={ValidateInscription} />
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
        <Stack.Screen name='ChatInfluenceur' component={ChatInfluenceurScreen} />
        <Stack.Screen name='DealDetailsInfluenceur' component={DealDetailsInfluenceurScreen} />
        <Stack.Screen name='DealsSeeMoreInfluenceur' component={DealsSeeMoreInfluenceurScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}