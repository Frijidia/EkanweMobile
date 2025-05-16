import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PortfolioStepScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [portfolioLink, setPortfolioLink] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.stepText}>4/4</Text>
          <Image 
            source={require('../../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.inscriptionText}>Inscription</Text>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.description}>
            Pour valider ton profil de créateur de contenu, tu dois nous envoyer quelques exemples de tes réalisations.
          </Text>
        </View>

        <View style={styles.portfolioContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ou colle un lien vers ton portfolio"
            placeholderTextColor="#9CA3AF"
            value={portfolioLink}
            onChangeText={setPortfolioLink}
          />
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
            onPress={() => navigation.navigate('RegistrationComplete')}
          >
            <Text style={styles.nextButtonText}>SUIVANT</Text>
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
  stepText: {
    color: '#fff',
    fontSize: 14,
    alignSelf: 'flex-end',
    marginBottom: 16
  },
  logo: {
    width: 144,
    height: 144,
    marginBottom: 24,
  },
  inscriptionText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 24,
    letterSpacing: 2
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  portfolioContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  backButton: {
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
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});