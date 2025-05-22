import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginOrConnect'>;

const { width } = Dimensions.get('window');

export const LoginOrConnectScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        Une communauté qui offre ensemble une visibilité qui circule.{"\n"}
        Rejoins le mouvement EKANWE.
      </Text>

      <View style={styles.card}>
        <Image
          source={require('../../assets/ekanwe-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.description}>
          Ton contenu a de la valeur. Échange-le contre des offres locales. Inscris-toi gratuitement.
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>CONNEXION</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Ou ?{' '}
          <Text
            onPress={() => navigation.navigate('Register')}
            style={styles.signupLink}
          >
            S'inscrire
          </Text>
        </Text>
      </View>

      <Image
        source={require('../../assets/characterWorkingOnLaptop.png')}
        style={styles.character}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
    padding: 24,
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    textAlign: 'center',
  },
  introText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#1A2C24',
    borderColor: '#aec9b6',
    borderWidth: 2,
    borderRadius: 16,
    width: width * 0.95,
    padding: 24,
    marginBottom: 24,
    zIndex: 10,
  },
  logo: {
    width: 96,
    height: 40,
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    color: 'white',
    marginBottom: 24,
  },
  loginButton: {
    borderColor: '#aec9b6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 12,
  },
  signupText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  signupLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  character: {
    position: 'absolute',
    width: 140,
    height: 140,
    bottom: 200,
    left: 30,
    zIndex: 0,
  },
});
