import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'; // Pour icône check

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrationComplete'>;

export const RegistrationCompleteScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const redirectUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const role = snap.data().role;

          setTimeout(() => {
            if (role === "influenceur") {
              navigation.replace('DealsInfluenceur');
            } else {
              navigation.replace('DealsCommercant');
            }
          }, 5000);
        }
      } catch (error) {
        console.error("Erreur de redirection :", error);
        Alert.alert("Erreur", "Impossible de charger vos données.");
      }
    };

    redirectUser();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../../assets/ekanwe-logo.png')} style={styles.logo} />

        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark-circle" size={64} color="white" />
        </View>

        <Text style={styles.title}>INSCRIPTION COMPLÉTÉE</Text>
        <View style={styles.separator} />

        <Text style={styles.message}>
          Félicitations ! Votre compte a été créé avec succès. Vous allez être redirigé vers votre espace personnel dans quelques secondes.
        </Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2C24',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1A2C24',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    borderWidth: 2,
    borderColor: '#AEC9B6',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  iconWrapper: {
    backgroundColor: '#FF6B2E',
    borderRadius: 50,
    padding: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  separator: {
    height: 4,
    width: 64,
    backgroundColor: '#FF6B2E',
    marginBottom: 16,
  },
  message: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});
