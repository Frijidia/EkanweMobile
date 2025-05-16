import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [mail, setMail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, mail, motdepasse);
      const userRef = doc(db, 'users', cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const { role, inscription } = userSnap.data();

        switch (inscription) {
          case '1':
            navigation.replace('RegistrationStepOne');
            break;
          case '2':
            navigation.replace('InterestStep');
            break;
          case '3':
            navigation.replace('SocialConnectStep');
            break;
          case '4':
            navigation.replace('PortfolioStep');
            break;
          case 'Terminé':
            if (role === 'commerçant') navigation.replace('DealsCommercant');
            else if (role === 'influenceur') navigation.replace('DealsInfluenceur');
            else setError('Rôle inconnu. Veuillez contacter l\'administrateur.');
            break;
          default:
            navigation.replace('LoginOrSignup');
        }
      } else {
        setError('Compte introuvable dans la base de données.');
      }
    } catch (err) {
      console.error(err);
      setError('Email ou mot de passe invalide.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Non disponible', 'La connexion avec Google sera disponible prochainement.');
    // Tu pourras lier @react-native-google-signin ou firebase/auth si tu configures bien le projet natif
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/ekanwe-logo.png')} style={styles.logo} />

      <Text style={styles.title}>Connexion</Text>

      <TextInput
        placeholder="Mail"
        placeholderTextColor="#ccc"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setMail}
        value={mail}
      />
      <TextInput
        placeholder="Mot de passe"
        placeholderTextColor="#ccc"
        style={styles.input}
        secureTextEntry
        onChangeText={setMotdepasse}
        value={motdepasse}
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgot}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>CONNEXION</Text>}
      </TouchableOpacity>

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>Ou continuer avec</Text>
        <View style={styles.separatorLine} />
      </View>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
        <Image
          source={{ uri: 'https://www.google.com/favicon.ico' }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Continuer avec Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retour}>
        <Text style={{ color: '#ccc' }}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 50,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: 'white',
  },
  forgot: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#ccc',
    marginBottom: 12,
  },
  error: {
    color: '#F87171',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#FF6B2E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#666',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#ccc',
    fontSize: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: '#333',
    fontWeight: 'bold',
  },
  retour: {
    marginTop: 24,
  },
});
