import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const { role, inscription, status } = userSnap.data();

          if (inscription === "1") {
            navigation.navigate("RegistrationStepOne");
          } else if (inscription === "2") {
            navigation.navigate("InterestStep");
          } else if (inscription === "3") {
            navigation.navigate("SocialConnect");
          } else if (inscription === "4") {
            navigation.navigate("PortfolioStep");
          } else if (inscription === "Terminé" && status === "valide") {
            if (role === "commerçant") {
              navigation.navigate("DealsCommercant");
            } else if (role === "influenceur") {
              navigation.navigate("DealsInfluenceur");
            }
          } else if (inscription === "Terminé" && status === "en attente") {
            navigation.navigate("RegistrationComplete");
          }
        } else {
          navigation.navigate("Connection");
        }
      } catch (e) {
        console.error("Erreur lors de la récupération de l'utilisateur :", e);
        navigation.navigate("Connection");
      }
    } else {
      navigation.navigate("Connection");
    }
  });

  return () => unsubscribe();
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