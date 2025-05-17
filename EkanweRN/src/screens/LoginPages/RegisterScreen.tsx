import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({ email: '', password: '', confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const fullName = user.displayName || '';
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ');

        await setDoc(userRef, {
          email: user.email,
          nom: lastName || null,
          prenoms: firstName || null,
          photoURL: user.photoURL || null,
          role: null, // À modifier selon ton contexte
          dateCreation: new Date(),
          inscription: '1',
        });
      }

      navigation.replace('RegistrationStepOne');
    } catch (err) {
      console.error('Erreur Google Sign In :', err);
      setError('Erreur lors de la connexion avec Google.');
      Alert.alert('Erreur', 'Échec de la connexion Google');
    } finally {
      setLoading(false);
    }
  };

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
      await sendEmailVerification(cred.user);

      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        email,
        role: null, // À modifier selon ton contexte
        dateCreation: new Date(),
        inscription: '1',
      });

      navigation.replace('ValidateInscription');
    } catch (err: any) {
      console.error('Erreur d\'inscription :', err);
      setError('Une erreur est survenue : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/ekanwe-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Créer un compte</Text>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignUp} disabled={loading}>
        <Image
          source={{ uri: 'https://www.google.com/favicon.ico' }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>
          {loading ? 'Connexion...' : 'Continuer avec Google'}
        </Text>
      </TouchableOpacity>

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
});
