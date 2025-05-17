import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebase/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ValidateInscription'>;

export const ValidateInscriptionScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const interval = setInterval(() => {
      auth.currentUser?.reload().then(() => {
        if (auth.currentUser?.emailVerified) {
          clearInterval(interval);
          navigation.replace('RegistrationStepOne');
        }
      }).catch((err) => {
        console.error('Erreur lors du reload :', err);
        Alert.alert('Erreur', 'Impossible de vérifier votre email pour l’instant.');
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../../assets/ekanwe-logo.png')} style={styles.logo} />
        <Text style={styles.title}>TA DEMANDE DE CANDIDATURE A ÉTÉ ENVOYÉE !</Text>
        <Image source={require('../../assets/validatepagelogo.png')} style={styles.icon} />

        <Text style={styles.section}>Vérifications</Text>
        <Text style={styles.text}>
          Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation
          pour finaliser votre inscription.
        </Text>
        <Text style={styles.text}>
          Si vous ne recevez pas d'email dans les prochaines minutes, vérifiez votre dossier spam.
        </Text>

        <ActivityIndicator size="large" color="#FF6B2E" style={{ marginTop: 30 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1A2C24',
    borderColor: '#AEC9B6',
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  icon: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  section: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  text: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});
