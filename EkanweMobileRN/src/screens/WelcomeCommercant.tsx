import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';

type WelcomeCommercantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WelcomeCommercant'>;

export const WelcomeCommercant = () => {
  const navigation = useNavigation<WelcomeCommercantScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/commercant-welcome.png')}
          style={styles.image}
        />
        <Text style={styles.title}>Bienvenue sur Ekanwe</Text>
        <Text style={styles.description}>
          Connectez-vous avec des influenceurs pour promouvoir votre entreprise et atteindre de nouveaux clients
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progress} />
          </View>
          <Text style={styles.progressText}>Étape 1/3</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="COMMENCER"
          onPress={() => navigation.navigate('CreatorCommercant')}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 8,
  },
  progress: {
    width: '33%',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  footer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
  },
}); 