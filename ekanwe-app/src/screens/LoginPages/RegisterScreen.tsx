import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { useUserData } from '../../context/UserContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({ email: '', password: '', confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [birthDate] = useState(new Date());
  const { userData } = useUserData();
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        if (mounted) setAppleAvailable(available);
      } catch (e) {
        console.error('Erreur while checking Apple availability', e);
        if (mounted) setAppleAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ------- CONFIGURE GOOGLE SIGNIN (replace the placeholder) -------
  useEffect(() => {
    GoogleSignin.configure({
      // Get this value from Firebase Console (see instructions in the companion guide).
      webClientId: '177322625777-o67l5o62gcau4h8074q0b9q781shpcla.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Helper: create user doc in Firestore if it doesn't exist
  const createOrUpdateUserDoc = async (uid: string, userInfo: any) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: userInfo.email || null,
        displayName: userInfo.displayName || null,
        role: userData?.role || null,
        dateCreation: new Date(),
        inscription: '1',
      });
    }
  };

  // ----------------- Email/Password registration (no email verification) -----------------
  const handleRegister = async () => {
    const { email, password, confirmation } = formData;
    if (!email || !password || !confirmation) {
      return setError('Tous les champs sont requis !');
    }
    if (password !== confirmation) {
      return setError('Les mots de passe ne correspondent pas.');
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // NOTE: we intentionally DO NOT call sendEmailVerification here (no verification required)
      await createOrUpdateUserDoc(cred.user.uid, { email: cred.user.email });
      navigation.replace('RegistrationStepOne');
    } catch (err: any) {
      console.error("Erreur d'inscription :", err);
      setError("Une erreur est survenue lors de l'inscription. Vérifiez l'email ou réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Google Sign-In -----------------
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      // make sure device has play services (android) — the lib will handle it
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;
      if (!idToken) throw new Error('No idToken from Google Signin');

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);

      const firebaseUser = userCredential.user;
      await createOrUpdateUserDoc(firebaseUser.uid, {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      });

      navigation.replace('RegistrationStepOne');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError('Impossible de se connecter avec Google.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Apple Sign-In -----------------
  // NOTE: On iOS you *must* enable Sign in with Apple in your Apple Dev account & in Xcode.
  // The library `@invertase/react-native-apple-authentication` auto-SHA256-hashes the nonce for you.
  const generateNonce = (length = 32) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const handleAppleSignUp = async () => {
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
      const firebaseUser = userCredential.user;

      await createOrUpdateUserDoc(firebaseUser.uid, {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      });

      navigation.replace('RegistrationStepOne');
    } catch (err: any) {
      if (err.code === 'ERR_CANCELED') {
        console.log('Connexion annulée par l’utilisateur');
      } else {
        console.error('Apple sign-in error:', err);
        setError("Impossible de se connecter avec Apple. " + err);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Image source={require('../../assets/ekanwe-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Créer un compte</Text>

      <TouchableOpacity style={styles.socialBtnGoogle} onPress={handleGoogleSignUp} disabled={loading}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>{loading ? 'Connexion...' : 'Continuer avec Google'}</Text>
      </TouchableOpacity>

      {appleAvailable && (
        <TouchableOpacity style={styles.socialBtnApple} onPress={() => { if (loading) return; handleAppleSignUp(); }}
          disabled={loading}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>{loading ? 'Connexion...' : 'Continuer avec Apple'}</Text>
        </TouchableOpacity>)}

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>ou</Text>
        <View style={styles.separatorLine} />
      </View>

      <TextInput
        placeholder="Email"
        style={styles.input}
        placeholderTextColor="#ccc"
        value={formData.email}
        onChangeText={(text) => handleInputChange('email', text)}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Créer un mot de passe"
        style={styles.input}
        placeholderTextColor="#ccc"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleInputChange('password', text)}
      />
      <TextInput
        placeholder="Confirmer le mot de passe"
        style={styles.input}
        placeholderTextColor="#ccc"
        secureTextEntry
        value={formData.confirmation}
        onChangeText={(text) => handleInputChange('confirmation', text)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.registerBtn, loading && { backgroundColor: '#888' }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerText}>S'INSCRIRE</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('LoginOrConnect')} style={styles.retour}>
        <Text style={{ color: '#ccc' }}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

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
  appleBtn: { padding: 12, borderRadius: 8, backgroundColor: '#111', marginTop: 12, borderWidth: 1, borderColor: '#333' },
  appleText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  input: {
    width: '100%',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: 'white',
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
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
  googleText: {
    color: '#333',
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
  registerBtn: {
    width: '100%',
    backgroundColor: '#FF6B2E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  retour: {
    marginTop: 24,
  },
  datePickerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  datePickerText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'left',
  },
  datePicker: {
    width: '100%',
    backgroundColor: '#fff',
  },
});
