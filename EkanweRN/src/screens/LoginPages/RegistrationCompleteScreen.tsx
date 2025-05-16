import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CheckCircle } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegistrationCompleteScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  React.useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigation.navigate('DealsInfluenceur');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Image 
            source={require('../../assets/ekanwe-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.checkCircleContainer}>
            <CheckCircle size={64} color="#fff" />
          </View>

          <Text style={styles.title}>INSCRIPTION COMPLÉTÉE</Text>

          <View style={styles.divider} />

          <Text style={styles.description}>
            Félicitations ! Votre compte a été vérifié avec succès. Vous allez être redirigé vers votre espace personnel dans quelques secondes.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('DealsInfluenceur')}
          >
            <Text style={styles.buttonText}>CONTINUER</Text>
          </TouchableOpacity>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
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
    backgroundColor: 'rgba(26, 44, 36, 0.9)',
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 144,
    height: 40,
    marginBottom: 40,
  },
  checkCircleContainer: {
    backgroundColor: '#FF6B2E',
    borderRadius: 50,
    padding: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  divider: {
    width: 64,
    height: 4,
    backgroundColor: '#FF6B2E',
    marginBottom: 24,
  },
  description: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#FF6B2E',
  },
});
