import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    mail: '',
    motdepasse: '',
    confirmMotdepasse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!registerData.nom || !registerData.prenom || !registerData.mail || !registerData.motdepasse || !registerData.confirmMotdepasse) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (registerData.motdepasse !== registerData.confirmMotdepasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implémenter la logique d'inscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('RegistrationStepOne');
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcome}>Bienvenue</Text>
          <Text style={styles.title}>Inscription</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            placeholderTextColor="#9CA3AF"
            value={registerData.nom}
            onChangeText={(text) => setRegisterData({ ...registerData, nom: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            placeholderTextColor="#9CA3AF"
            value={registerData.prenom}
            onChangeText={(text) => setRegisterData({ ...registerData, prenom: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Mail"
            placeholderTextColor="#9CA3AF"
            value={registerData.mail}
            onChangeText={(text) => setRegisterData({ ...registerData, mail: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={registerData.motdepasse}
            onChangeText={(text) => setRegisterData({ ...registerData, motdepasse: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={registerData.confirmMotdepasse}
            onChangeText={(text) => setRegisterData({ ...registerData, confirmMotdepasse: text })}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Connection')}
          >
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>S'INSCRIRE</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Ou continuer avec</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.googleButton}
          onPress={() => {/* TODO: Implémenter l'inscription avec Google */}}
          disabled={loading}
        >
          <Image 
            source={{ uri: 'https://www.google.com/favicon.ico' }} 
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            {loading ? 'Inscription...' : 'Continuer avec Google'}
          </Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  welcome: {
    color: '#D1D5DB',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 6,
    padding: 10,
    color: '#fff',
    fontSize: 14,
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4B5563',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginHorizontal: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
}); 