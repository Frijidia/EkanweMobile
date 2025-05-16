import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SocialConnectScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    instagram: '',
    tiktok: ''
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({...prev, [name]: value}));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.stepText}>3/4</Text>
          <Image 
            source={require('../../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.inscriptionText}>Inscription</Text>
          <Text style={styles.title}>Connexion réseaux</Text>
        </View>

        <View style={styles.networksContainer}>
          <View style={styles.networkInput}>
            <Image 
              source={require('../../assets/instagramlogo.png')}
              style={styles.networkIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Lien ou pseudo Instagram"
              placeholderTextColor="#9CA3AF"
              value={formData.instagram}
              onChangeText={(value) => handleChange('instagram', value)}
            />
          </View>

          <View style={styles.networkInput}>
            <Image 
              source={require('../../assets/tiktoklogo.png')}
              style={styles.networkIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Lien ou pseudo TikTok"
              placeholderTextColor="#9CA3AF" 
              value={formData.tiktok}
              onChangeText={(value) => handleChange('tiktok', value)}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('InterestStep')}
          >
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => navigation.navigate('PortfolioStep')}
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
  },
  networksContainer: {
    gap: 24,
    marginVertical: 24,
  },
  networkInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  networkIcon: {
    width: 40,
    height: 40,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF',
    paddingVertical: 4,
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