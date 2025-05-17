import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DealDetailsRouteProp = RouteProp<RootStackParamList, 'DealDetailsInfluenceur'>;

const ProgressRibbon = ({ currentStep = 1, status }: { currentStep: number; status: string }) => {
  if (status === "Refusé") {
    return (
      <View style={styles.refusedRibbon}>
        <Text style={styles.refusedText}>Refusé</Text>
      </View>
    );
  }

  const steps = ["Envoyé", "Accepté", "Approbation", "Terminé"];
  return (
    <View style={styles.progressContainer}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepWrapper}>
            <Text style={[
              styles.stepText,
              index < currentStep && styles.activeStepText
            ]}>
              {step}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStep - 1 && styles.activeStepLine
              ]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export const DealDetailsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DealDetailsRouteProp>();
  const [saved, setSaved] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [status, setStatus] = useState("Envoyé");
  const currentStep = 1;

  const deal = {
    id: route.params?.dealId,
    title: 'Promotion Restaurant',
    description: 'Offre spéciale pour les influenceurs culinaires. Venez découvrir notre nouvelle carte et partagez votre expérience avec vos followers.',
    image: require('../../assets/photo.jpg'),
    locationName: 'Paris, France',
    interests: ['Restaurant', 'Food', 'Lifestyle'],
    typeOfContent: 'Photos et Stories Instagram',
    validUntil: '31/12/2023',
    conditions: 'Minimum 10k followers'
  };

  const handleToggleSave = () => {
    setSaved(!saved);
  };

  const handleCandidature = () => {
    setAlreadyApplied(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FF6B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deals</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={deal.image} style={styles.dealImage} resizeMode="cover" />
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleToggleSave}
          >
            <Icon 
              name={saved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color="#1A2C24" 
            />
          </TouchableOpacity>
        </View>

        <ProgressRibbon currentStep={currentStep} status={status} />

        <View style={styles.detailsContainer}>
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.title}>{deal.title}</Text>
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={16} color="#FF6B2E" />
                <Text style={styles.location}>{deal.locationName}</Text>
              </View>
            </View>
            <Text style={styles.dealId}>#{deal.id}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{deal.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intérêts</Text>
            <View style={styles.interestsContainer}>
              {deal.interests.map((interest, index) => (
                <Text key={index} style={styles.interest}>{interest}</Text>
              ))}
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type de Contenu</Text>
              <Text style={styles.infoValue}>{deal.typeOfContent}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date de Validité</Text>
              <Text style={styles.infoValue}>{deal.validUntil}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Conditions</Text>
              <Text style={styles.infoValue}>{deal.conditions}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backBtnText}>RETOUR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.applyBtn, alreadyApplied && styles.disabledBtn]}
              onPress={handleCandidature}
              disabled={alreadyApplied}
            >
              <Text style={styles.applyBtnText}>
                {alreadyApplied ? "Candidature envoyée" : "EXÉCUTER"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f6ed'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    color: '#FF6B2E',
    fontWeight: '500'
  },
  content: {
    flex: 1
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#eee'
  },
  dealImage: {
    width: '100%',
    height: '100%'
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20
  },
  progressContainer: {
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginTop: 8
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepText: {
    color: '#FF6B2E',
    fontSize: 12,
    opacity: 0.7
  },
  activeStepText: {
    fontWeight: 'bold',
    opacity: 1
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#FF6B2E',
    opacity: 0.3,
    marginHorizontal: 4
  },
  activeStepLine: {
    opacity: 1
  },
  refusedRibbon: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 8,
    margin: 16,
    marginTop: 8,
    alignItems: 'center'
  },
  refusedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  location: {
    marginLeft: 4,
    color: '#666'
  },
  dealId: {
    color: '#FF6B2E',
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    fontSize: 12
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8
  },
  description: {
    color: '#666',
    lineHeight: 20
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  interest: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: '#666',
    fontSize: 12
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2C24'
  },
  infoValue: {
    maxWidth: '60%',
    textAlign: 'right',
    color: '#666',
    fontSize: 14
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#1A2C24',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  backBtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#FF6B2E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  applyBtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
  },
  disabledBtn: {
    backgroundColor: '#ccc'
  }
});