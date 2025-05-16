import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';

type Props = {
  navigation: NavigationProp<ParamListBase>;
};

export const DealsSeeMoreInfluenceurScreen: React.FC<Props> = ({ navigation }) => {
  const [saved, setSaved] = useState(false);

  const deal = {
    id: '1',
    title: 'Promotion Restaurant',
    description: 'Offre spéciale pour les influenceurs culinaires. Venez découvrir notre nouvelle carte et partagez votre expérience avec vos followers.',
    image: require('../../assets/photo.jpg'),
    locationName: 'Paris, France',
    interests: ['Restaurant', 'Food', 'Lifestyle'],
    typeOfContent: 'Photos et Stories Instagram',
    validUntil: '31/12/2023',
    conditions: 'Minimum 10k followers',
    alreadyApplied: false
  };

  const handleToggleSave = () => {
    setSaved(!saved);
  };

  const handleApply = () => {
    navigation.navigate('DealDetailsInfluenceur', { dealId: deal.id });
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
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image source={deal.image} style={styles.dealImage} />
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

          <View style={styles.dealInfo}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{deal.title}</Text>
              <Text style={styles.dealId}>#{deal.id}</Text>
            </View>

            <View style={styles.locationContainer}>
              <Icon name="map-marker" size={16} color="#FF6B2E" />
              <Text style={styles.location}>{deal.locationName}</Text>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{deal.description}</Text>

            <Text style={styles.sectionTitle}>Intérêts</Text>
            <View style={styles.interestsContainer}>
              {deal.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type de Contenu</Text>
                <Text style={styles.detailValue}>{deal.typeOfContent}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date de Validité</Text>
                <Text style={styles.detailValue}>{deal.validUntil}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Conditions</Text>
                <Text style={styles.detailValue}>{deal.conditions}</Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backBtnText}>RETOUR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, deal.alreadyApplied && styles.disabledBtn]}
                onPress={handleApply}
                disabled={deal.alreadyApplied}
              >
                <Text style={styles.applyBtnText}>
                  {deal.alreadyApplied ? "Candidature envoyée" : "EXÉCUTER"}
                </Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#F5F5E7',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FF6B2E',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 16/9,
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  dealInfo: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    flex: 1,
  },
  dealId: {
    color: '#FF6B2E',
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    color: '#1A2C24',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8,
  },
  description: {
    color: '#1A2C24',
    marginBottom: 16,
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  interestText: {
    color: '#1A2C24',
    fontSize: 14,
  },
  detailsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  detailValue: {
    color: '#1A2C24',
    maxWidth: '60%',
    textAlign: 'right',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#1A2C24',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#FF6B2E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: '#9ca3af',
  },
});