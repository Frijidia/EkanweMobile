import React, { useState } from 'react';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

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
      // La logique d'authentification sera gérée par le backend
      navigation.navigate('WelcomeInfluenceur');
    } catch (err) {
      console.error(err);
      setError("Email ou mot de passe invalide.");
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
            <Input
              label="Email"
              value={loginData.mail}
              onChangeText={(text) => setLoginData({ ...loginData, mail: text })}
              placeholder="Entrez votre email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Mot de passe"
              value={loginData.motdepasse}
              onChangeText={(text) => setLoginData({ ...loginData, motdepasse: text })}
              placeholder="Entrez votre mot de passe"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')} // Temporarily navigate to Login since ForgotPassword isn't defined
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <Button
              title="RETOUR"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
            <Button
              title={loading ? "Connexion..." : "CONNEXION"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou continuer avec</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continuer avec Google"
            onPress={() => {}}
            style={styles.googleButton}
            textStyle={styles.googleButtonText}
          />
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  error: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
  },
  backButtonText: {
    color: 'white',
  },
  loginButton: {
    flex: 2,
    backgroundColor: '#007AFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4B5563',
  },
  dividerText: {
    color: '#9CA3AF',
    marginHorizontal: 12,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: 'white',
  },
  googleButtonText: {
    color: '#1A2C24',
  },
}); 