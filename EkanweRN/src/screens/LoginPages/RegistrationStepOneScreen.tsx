import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegistrationStepOneScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stepData, setStepData] = useState({
    pseudo: '',
    telephone: '',
    dateNaissance: '',
    adresse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!stepData.pseudo || !stepData.telephone || !stepData.dateNaissance || !stepData.adresse) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      // TODO: Sauvegarder les données
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('InterestStep');
    } catch (err) {
      setError('Une erreur est survenue.');
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
          <Text style={styles.title}>Étape 1</Text>
          <Text style={styles.subtitle}>Complétez votre profil</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Pseudo"
            placeholderTextColor="#9CA3AF"
            value={stepData.pseudo}
            onChangeText={(text) => setStepData({ ...stepData, pseudo: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            placeholderTextColor="#9CA3AF"
            value={stepData.telephone}
            onChangeText={(text) => setStepData({ ...stepData, telephone: text })}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Date de naissance (JJ/MM/AAAA)"
            placeholderTextColor="#9CA3AF"
            value={stepData.dateNaissance}
            onChangeText={(text) => setStepData({ ...stepData, dateNaissance: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Adresse"
            placeholderTextColor="#9CA3AF"
            value={stepData.adresse}
            onChangeText={(text) => setStepData({ ...stepData, adresse: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Register')}
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
              <Text style={styles.nextButtonText}>SUIVANT</Text>
            )}
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
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
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