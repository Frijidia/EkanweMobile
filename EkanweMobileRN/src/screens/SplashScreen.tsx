import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();

        if (userDoc.exists) {
          const data = userDoc.data();
          const role = data?.role;
          const inscription = data?.inscription;

          switch (inscription) {
            case "1":
              navigation.replace('RegistrationStepOne');
              break;
            case "2":
              navigation.replace('InterestStep');
              break;
            case "3":
              navigation.replace('SocialConnectStep');
              break;
            case "4":
              navigation.replace('PortfolioStep');
              break;
            case "Terminé":
              if (role === "commerçant") {
                navigation.replace('DealsCommercant');
              } else if (role === "influenceur") {
                navigation.replace('DealsInfluenceur');
              }
              break;
            default:
              navigation.replace('Connection');
          }
        }
      } else {
        navigation.replace('Connection');
      }
    });

    const timer = setTimeout(() => {
      unsubscribe();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/ekanwe-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 128,
    height: 128,
  },
}); 