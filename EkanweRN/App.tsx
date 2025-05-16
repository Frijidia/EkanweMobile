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
      </Stack.Navigator>
    </NavigationContainer>
  );
}