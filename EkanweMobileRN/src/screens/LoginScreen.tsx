import React, { useState } from 'react';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { RootStackParamList } from '../types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [loginData, setLoginData] = useState({
    mail: '',
    motdepasse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const userCredential = await auth().signInWithEmailAndPassword(
        loginData.mail,
        loginData.motdepasse
      );

      const user = userCredential.user;
      const userDoc = await firestore().collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        const data = userDoc.data();
        const role = data?.role;
        const inscription = data?.inscription;

        switch (inscription) {
          case "1":
            navigation.navigate('RegistrationStepOne');
            break;
          case "2":
            navigation.navigate('InterestStep');
            break;
          case "3":
            navigation.navigate('SocialConnectStep');
            break;
          case "4":
            navigation.navigate('PortfolioStep');
            break;
          case "terminé":
            if (role === "commerçant") {
              navigation.navigate('DealsCommercant');
            } else if (role === "influenceur") {
              navigation.navigate('DealsInfluenceur');
            } else {
              setError("Rôle inconnu. Veuillez contacter l'administrateur.");
            }
            break;
          default:
            navigation.navigate('LoginOrSignup');
        }
      } else {
        setError("Compte introuvable dans la base de données.");
      }
    } catch (err) {
      console.error(err);
      setError("Email ou mot de passe invalide.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();

      if (userDoc.exists) {
        const data = userDoc.data();
        const { role, inscription } = data;

        if (inscription === "Non Terminé") {
          setError("Inscription non terminée.");
          return;
        }

        if (role === "commerçant") {
          navigation.navigate('DealsCommercant');
        } else if (role === "influenceur") {
          navigation.navigate('DealsInfluenceur');
        } else {
          setError("Rôle inconnu. Veuillez contacter l'administrateur.");
        }
      } else {
        setError("Compte inexistant. Veuillez vous inscrire d'abord.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion avec Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://s3-alpha-sig.figma.com/img/766b/e8b9/25ea265fc6d5c0f04e3e93b27ecd65cb?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EsyWng5rz5MuEwYQEk01lU7LKsfv2EWoe-0bq8GtYOwvCr3abuoIOUk5UIU3it2DcnrX49Xu~~t-IdgxVen0GevBunbegAqHR-Jki-XrC1EnR84TWM8CrfsNvORud11qi3me9rQJIApdEysnnnPqTq4wtpdrQF9Tho0kRwj7r4IJOftLpWgG4ktpqP2iCobbbxs1KxnwQ7328NMqGPkUlWZ~TPbIg4oFsIzp8xDvk-c3TXJvy8UqR96LNu5zX1BNr~~VsdBcufw5AO8sOty0qgnylO6Lfr0dN-bWqe9zDc~e6PfZRxRupZ-t3vGrHT-KpU3Y0C~pK11-xCM4Tug1rw__' }}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('../assets/ekanwe-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Bienvenue</Text>
            <Text style={styles.title}>Connexion</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              mode="outlined"
              label="Mail"
              value={loginData.mail}
              onChangeText={(text) => setLoginData({ ...loginData, mail: text })}
              style={styles.input}
              theme={{ colors: { primary: 'white' } }}
            />
            <TextInput
              mode="outlined"
              label="Mot de passe"
              value={loginData.motdepasse}
              onChangeText={(text) => setLoginData({ ...loginData, motdepasse: text })}
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: 'white' } }}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              textColor="white"
            >
              RETOUR
            </Button>
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            >
              {loading ? "Connexion..." : "CONNEXION"}
            </Button>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou continuer avec</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="contained"
            onPress={handleGoogleLogin}
            loading={loading}
            disabled={loading}
            style={styles.googleButton}
            icon="google"
          >
            Continuer avec Google
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(26, 44, 36, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 144,
    height: 144,
    marginBottom: 24,
  },
  welcomeText: {
    color: '#9CA3AF',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  error: {
    color: '#F87171',
    textAlign: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    borderColor: 'white',
  },
  loginButton: {
    backgroundColor: '#FF6B2E',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4B5563',
  },
  dividerText: {
    color: '#9CA3AF',
    marginHorizontal: 8,
    fontSize: 12,
  },
  googleButton: {
    backgroundColor: 'white',
  },
}); 