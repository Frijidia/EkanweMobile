import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';

type InterestStepScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'InterestStep'>;

const INTERESTS = [
  'Mode',
  'Beauté',
  'Technologie',
  'Gastronomie',
  'Voyage',
  'Sport',
  'Lifestyle',
  'Art',
  'Musique',
  'Cinéma',
  'Jeux vidéo',
  'Fitness',
  'Santé',
  'Éducation',
  'Business',
];

export const InterestStep = () => {
  const navigation = useNavigation<InterestStepScreenNavigationProp>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleContinue = () => {
    // La logique de sauvegarde des intérêts sera gérée par le backend
    navigation.navigate('SocialConnectStep');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vos centres d'intérêt</Text>
        <Text style={styles.subtitle}>
          Sélectionnez les domaines qui vous intéressent pour personnaliser votre expérience
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                selectedInterests.includes(interest) && styles.interestButtonSelected,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.interestTextSelected,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="RETOUR"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Button
          title="CONTINUER"
          onPress={handleContinue}
          disabled={selectedInterests.length === 0}
          style={styles.continueButton}
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
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
    backgroundColor: 'transparent',
  },
  interestButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  interestText: {
    color: 'white',
    fontSize: 14,
  },
  interestTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
  },
  backButtonText: {
    color: 'white',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#007AFF',
  },
}); 