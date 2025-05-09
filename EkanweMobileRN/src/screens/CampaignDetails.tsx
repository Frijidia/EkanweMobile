import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';

type CampaignDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CampaignDetails'>;
type CampaignDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CampaignDetails'>;

export const CampaignDetails = () => {
  const navigation = useNavigation<CampaignDetailsScreenNavigationProp>();
  const route = useRoute<CampaignDetailsScreenRouteProp>();

  // Données de test
  const campaign = {
    id: route.params.campaignId,
    title: 'Campagne Instagram',
    description: 'Promotion de notre nouvelle collection de vêtements pour l\'été 2024. Nous recherchons des influenceurs mode pour créer du contenu authentique et engageant.',
    budget: '500€',
    deadline: '15 jours',
    requirements: [
      'Minimum 10K followers sur Instagram',
      'Taux d\'engagement > 3%',
      'Contenu de qualité et authentique',
      'Publication de 3 posts minimum',
    ],
    image: require('../assets/deal1.png'),
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Détails de la campagne</Text>
        <View style={styles.placeholder} />
      </View>

      <Image source={campaign.image} style={styles.campaignImage} />

      <View style={styles.content}>
        <Text style={styles.campaignTitle}>{campaign.title}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailValue}>{campaign.budget}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Délai</Text>
            <Text style={styles.detailValue}>{campaign.deadline}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{campaign.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prérequis</Text>
          {campaign.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        <Button
          title="POSTULER"
          onPress={() => console.log('Postuler à la campagne', campaign.id)}
          style={styles.applyButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    color: 'white',
    fontSize: 24,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  campaignImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 20,
  },
  campaignTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#2A3C34',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  requirementBullet: {
    color: '#007AFF',
    fontSize: 16,
    marginRight: 8,
  },
  requirementText: {
    color: '#9CA3AF',
    fontSize: 16,
    flex: 1,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    marginTop: 16,
  },
}); 