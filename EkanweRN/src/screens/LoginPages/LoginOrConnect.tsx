import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginOrConnect = () => {
  const navigation = useNavigation<NavigationProp>();
  const [error, setError] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.spacer} />

      <Image
        source={require('../../assets/characterWorkingOnLaptop.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />

      <View style={styles.cardContainer}>
        <Image
          source={require('../../assets/ekanwe-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.headerText}>
          Une communauté qui offre ensemble une visibilité qui circule.{'\n'}
          Rejoins le mouvement EKANWE.
        </Text>

        <Text style={styles.cardText}>
          Ton contenu a de la valeur. Échange-le contre des offres locales. Inscris-toi gratuitement.
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>CONNEXION</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Ou ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
    padding: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F87171',
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
  headerText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#1A2C24',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#aec9b6',
    padding: 32,
    paddingBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  cardText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#aec9b6',
    padding: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: 'white',
    fontSize: 12,
  },
  registerLink: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  characterImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: -15,
    marginRight: 150,
  },
}); 