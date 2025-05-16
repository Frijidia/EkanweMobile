import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PortfolioStepScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      // TODO: Sauvegarder le portfolio
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('DealsInfluenceur');
    } catch (err) {
      // Gérer l'erreur
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Étape 4</Text>
          <Text style={styles.subtitle}>Créez votre portfolio</Text>
        </View>

        <View style={styles.portfolioContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>+ Ajouter une photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('SocialConnect')}
          >
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>TERMINER</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  content: {
    padding: 16,
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
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  portfolioContainer: {
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
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
  nextButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 