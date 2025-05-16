import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegistrationStepOneScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    naissance: '',
    telephone: '',
    pseudo: '',
  });

  const handleSubmit = () => {
    navigation.navigate('InterestStep');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.stepIndicator}>1/4</Text>

        <View style={styles.header}>
          <Image 
            source={require('../../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Inscription</Text>
          <Text style={styles.title}>Informations</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            placeholderTextColor="#9CA3AF"
            value={formData.nom}
            onChangeText={(text) => setFormData({ ...formData, nom: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Prénoms"
            placeholderTextColor="#9CA3AF"
            value={formData.prenoms}
            onChangeText={(text) => setFormData({ ...formData, prenoms: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Pseudonyme"
            placeholderTextColor="#9CA3AF"
            value={formData.pseudo}
            onChangeText={(text) => setFormData({ ...formData, pseudo: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Date de naissance"
            placeholderTextColor="#9CA3AF"
            value={formData.naissance}
            onChangeText={(text) => setFormData({ ...formData, naissance: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            placeholderTextColor="#9CA3AF"
            value={formData.telephone}
            onChangeText={(text) => setFormData({ ...formData, telephone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('LoginOrConnect')}
          >
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleSubmit}
          >
            <Text style={styles.nextButtonText}>SUIVANT</Text>
          </TouchableOpacity>
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
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    padding: 16,
  },
  stepIndicator: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16,
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
  subtitle: {
    color: '#9CA3AF',
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
    gap: 32,
    marginBottom: 24,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 