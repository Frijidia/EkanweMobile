import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Types pour les données de test
type Deal = {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  image: any;
};

type Influencer = {
  id: string;
  name: string;
  category: string;
  followers: string;
  image: any;
};

export const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userType] = useState<'influenceur' | 'commercant'>('influenceur'); // À remplacer par le vrai type d'utilisateur

  // Données de test pour les influenceurs
  const deals: Deal[] = [
    {
      id: '1',
      title: 'Campagne Instagram',
      description: 'Promotion de notre nouvelle collection de vêtements',
      budget: '500€',
      deadline: '15 jours',
      image: require('../assets/deal1.png'),
    },
    {
      id: '2',
      title: 'Vidéo TikTok',
      description: 'Création de contenu pour notre marque de cosmétiques',
      budget: '300€',
      deadline: '7 jours',
      image: require('../assets/deal2.png'),
    },
  ];

  // Données de test pour les commerçants
  const influencers: Influencer[] = [
    {
      id: '1',
      name: 'Sophie Martin',
      category: 'Mode & Beauté',
      followers: '50K',
      image: require('../assets/influencer1.png'),
    },
    {
      id: '2',
      name: 'Lucas Dubois',
      category: 'Lifestyle',
      followers: '100K',
      image: require('../assets/influencer2.png'),
    },
  ];

  const renderInfluencerHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bonjour, Sophie</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={require('../assets/profile-placeholder.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opportunités</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsContainer}>
          {deals.map((deal) => (
            <TouchableOpacity key={deal.id} style={styles.dealCard}>
              <Image source={deal.image} style={styles.dealImage} />
              <View style={styles.dealInfo}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                <Text style={styles.dealDescription}>{deal.description}</Text>
                <View style={styles.dealDetails}>
                  <Text style={styles.dealBudget}>{deal.budget}</Text>
                  <Text style={styles.dealDeadline}>{deal.deadline}</Text>
                </View>
                <Button
                  title="POSTULER"
                  onPress={() => console.log('Postuler à', deal.id)}
                  style={styles.dealButton}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Campagnes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2.5K</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCommercantHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bonjour, Entreprise</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={require('../assets/profile-placeholder.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Influenceurs recommandés</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.influencersContainer}>
          {influencers.map((influencer) => (
            <TouchableOpacity key={influencer.id} style={styles.influencerCard}>
              <Image source={influencer.image} style={styles.influencerImage} />
              <View style={styles.influencerInfo}>
                <Text style={styles.influencerName}>{influencer.name}</Text>
                <Text style={styles.influencerCategory}>{influencer.category}</Text>
                <Text style={styles.influencerFollowers}>{influencer.followers} followers</Text>
                <Button
                  title="CONTACTER"
                  onPress={() => console.log('Contacter', influencer.id)}
                  style={styles.influencerButton}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campagnes actives</Text>
        <View style={styles.campaignsContainer}>
          <View style={styles.campaignCard}>
            <Text style={styles.campaignTitle}>Campagne Instagram</Text>
            <Text style={styles.campaignStatus}>En cours</Text>
            <View style={styles.campaignProgress}>
              <View style={[styles.progressBar, { width: '60%' }]} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {userType === 'influenceur' ? renderInfluencerHome() : renderCommercantHome()}
    </View>
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
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  dealsContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dealCard: {
    width: 300,
    backgroundColor: '#2A3C34',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: 150,
  },
  dealInfo: {
    padding: 16,
  },
  dealTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  dealDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  dealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dealBudget: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dealDeadline: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  dealButton: {
    backgroundColor: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2A3C34',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  influencersContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  influencerCard: {
    width: 280,
    backgroundColor: '#2A3C34',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  influencerImage: {
    width: '100%',
    height: 200,
  },
  influencerInfo: {
    padding: 16,
  },
  influencerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  influencerCategory: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  influencerFollowers: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  influencerButton: {
    backgroundColor: '#007AFF',
  },
  campaignsContainer: {
    gap: 16,
  },
  campaignCard: {
    backgroundColor: '#2A3C34',
    borderRadius: 12,
    padding: 16,
  },
  campaignTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  campaignStatus: {
    color: '#10B981',
    fontSize: 14,
    marginBottom: 12,
  },
  campaignProgress: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
}); 