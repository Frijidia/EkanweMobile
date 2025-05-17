import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const { role, inscription } = userSnap.data();

          if (inscription === "1") navigation.replace("RegistrationStepOne");
          else if (inscription === "2") navigation.replace("InterestStep");
          else if (inscription === "3") navigation.replace("SocialConnectStep");
          else if (inscription === "4") navigation.replace("PortfolioStep");
          else if (inscription === "Terminé") {
            if (role === "commerçant") navigation.replace("DealsCommercant");
            else if (role === "influenceur") navigation.replace("DealsInfluenceur");
            else navigation.replace("Connection");
          } else {
            navigation.replace("Register");
          }
        } else {
          navigation.replace("Connection");
        }
      } else {
        navigation.replace("Connection");
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/ekanwe-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>EKANWE</Text>
        <Text style={styles.subtitle}>Le pouvoir du bouche-à-oreille numérique</Text>
      </Animated.View>
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
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
});
