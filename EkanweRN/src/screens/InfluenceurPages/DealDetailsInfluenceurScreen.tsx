import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DealDetailsRouteProp = RouteProp<RootStackParamList, 'DealDetailsInfluenceur'>;

export const DealDetailsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DealDetailsRouteProp>();
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Simuler les données du deal
  const deal = {
    id: route.params.dealId,
    title: 'Promotion Restaurant',
    description: 'Offre spéciale pour les influenceurs culinaires. Venez découvrir notre nouvelle carte et partagez votre expérience avec vos followers.',
    image: require('../../assets/photo.jpg'),
    merchant: {
      name: 'Le Petit Bistrot',
      image: require('../../assets/photo.jpg'),
      rating: 4.5,
      reviews: 128,
    },
    requirements: [
      'Minimum 10k followers sur Instagram',
      'Contenu de qualité',
      'Engagement minimum de 3%',
    ],
    reward: '50€',
    duration: '1 mois',
    location: 'Paris, France',
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={deal.image} style={styles.image} />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Icon 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{deal.title}</Text>
          
          <View style={styles.merchantInfo}>
            <Image source={deal.merchant.image} style={styles.merchantImage} />
            <View style={styles.merchantDetails}>
              <Text style={styles.merchantName}>{deal.merchant.name}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{deal.merchant.rating}</Text>
                <Text style={styles.reviews}>({deal.merchant.reviews} avis)</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{deal.description}</Text>

          <Text style={styles.sectionTitle}>Prérequis</Text>
          {deal.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="cash" size={24} color="#FF6B2E" />
              <Text style={styles.infoText}>{deal.reward}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="clock-outline" size={24} color="#FF6B2E" />
              <Text style={styles.infoText}>{deal.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="map-marker" size={24} color="#FF6B2E" />
              <Text style={styles.infoText}>{deal.location}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.followButton]}
          onPress={() => setIsFollowing(!isFollowing)}
        >
          <Icon 
            name={isFollowing ? "heart" : "heart-outline"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.buttonText}>
            {isFollowing ? 'Suivi' : 'Suivre'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.applyButton]}
          onPress={() => navigation.navigate('DiscussionInfluenceur')}
        >
          <Text style={styles.buttonText}>Postuler</Text>
        </TouchableOpacity>
      </View>

      <BottomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  merchantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  merchantDetails: {
    flex: 1,
  },
  merchantName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#fff',
    marginLeft: 4,
    marginRight: 4,
  },
  reviews: {
    color: '#9CA3AF',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A3C34',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  followButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    backgroundColor: '#FF6B2E',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 