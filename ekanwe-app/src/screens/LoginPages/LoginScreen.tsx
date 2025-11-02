import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { signInWithEmailAndPassword, OAuthProvider, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [mail, setMail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  // ----- CHECK APPLE AVAILABILITY -----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        if (mounted) setAppleAvailable(available);
      } catch {
        if (mounted) setAppleAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ----- CONFIGURE GOOGLE SIGNIN -----
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '177322625777-o67l5o62gcau4h8074q0b9q781shpcla.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  // Helper: route en fonction du champ "inscription" + rôle
  const redirectUser = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
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
          navigation.replace('SocialConnect');
          break;
        case '4':
          navigation.replace('PortfolioStep');
          break;
        case 'Terminé':
          if (role === 'commerçant') navigation.replace('DealsCommercant');
          else if (role === 'influenceur') navigation.replace('DealsInfluenceur');
          else setError('Rôle inconnu. Contactez un administrateur.');
          break;
        default:
          navigation.replace('LoginOrConnect');
      }
    } else {
      setError('Compte introuvable dans la base de données.');
    }
  };

  // ----- LOGIN EMAIL/PASSWORD -----
  const handleLogin = async () => {
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, mail, motdepasse);
      await redirectUser(cred.user.uid);
    } catch (err) {
      console.error(err);
      setError('Email ou mot de passe invalide.');
    } finally {
      setLoading(false);
    }
  };

  // ----- LOGIN WITH GOOGLE -----
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;
      if (!idToken) throw new Error('Pas de idToken Google');

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);

      await redirectUser(userCredential.user.uid);
    } catch (err) {
      console.error('Google login error:', err);
      setError('Impossible de se connecter avec Google.');
    } finally {
      setLoading(false);
    }
  };

  // ----- LOGIN WITH APPLE -----
  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      const appleRes = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!appleRes.identityToken) throw new Error('Pas de token Apple');

      const provider = new OAuthProvider('apple.com');
      const appleCredential = provider.credential({
        idToken: appleRes.identityToken,
      } as any);

      const userCredential = await signInWithCredential(auth, appleCredential);
      await redirectUser(userCredential.user.uid);
    } catch (err: any) {
      if (err.code === 'ERR_CANCELED') {
        console.log('Connexion Apple annulée');
      } else {
        console.error('Apple login error:', err);
        setError("Impossible de se connecter avec Apple.");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <Image source={require('../../assets/ekanwe-logo.png')} style={styles.logo} />

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

      <TouchableOpacity style={styles.socialBtnGoogle} onPress={handleGoogleLogin} disabled={loading}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>{loading ? 'Connexion...' : 'Continuer avec Google'}</Text>
      </TouchableOpacity>

      {appleAvailable && (
        <TouchableOpacity style={styles.socialBtnApple} onPress={() => { if (loading) return; handleAppleLogin(); }}
          disabled={loading}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>{loading ? 'Connexion...' : 'Continuer avec Apple'}</Text>
        </TouchableOpacity>)}

      <TouchableOpacity onPress={() => navigation.navigate('LoginOrConnect')} style={styles.retour}>
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
  socialBtnGoogle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  socialBtnApple: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  socialText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1A2C24', // Texte Google sombre
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
