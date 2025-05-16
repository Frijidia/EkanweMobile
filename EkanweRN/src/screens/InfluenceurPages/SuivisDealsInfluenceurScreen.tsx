import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from '../components/BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SuivisDealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const followedDeals = [
    {
      id: '1',
      title: 'Promotion Restaurant',
      description: 'Offre spéciale pour les influenceurs culinaires',
      image: require('../assets/deal1.png'),
      merchant: 'Le Petit Bistrot',
      category: 'Restaurant',
      reward: '50€',
      status: 'En cours',
      progress: 75,
    },
    {
      id: '2',
      title: 'Collection Mode',
      description: 'Découvrez notre nouvelle collection',
      image: require('../assets/deal2.png'),
      merchant: 'Fashion Store',
      category: 'Mode',
      reward: '100€',
      status: 'En attente',
      progress: 0,
    },
    // Ajoutez plus de deals suivis ici
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deals suivis</Text>
      </View>

      <ScrollView style={styles.content}>
        {followedDeals.length > 0 ? (
          followedDeals.map((deal) => (
            <TouchableOpacity
              key={deal.id}
              style={styles.dealCard}
              onPress={() => navigation.navigate('DealDetailsInfluenceur', { dealId: deal.id })}
            >
              <Image source={deal.image} style={styles.dealImage} />
              <View style={styles.dealInfo}>
                <View style={styles.dealHeader}>
                  <Text style={styles.dealTitle}>{deal.title}</Text>
                  <View style={styles.statusContainer}>
                    <View 
                      style={[
                        styles.statusDot,
                        deal.status === 'En cours' ? styles.statusActive : styles.statusPending,
                      ]} 
                    />
                    <Text style={styles.statusText}>{deal.status}</Text>
                  </View>
                </View>
                <Text style={styles.dealDescription}>{deal.description}</Text>
                <View style={styles.dealFooter}>
                  <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>{deal.merchant}</Text>
                    <Text style={styles.reward}>{deal.reward}</Text>
                  </View>
                </View>
                {deal.status === 'En cours' && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${deal.progress}%` },
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{deal.progress}%</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="heart-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              Vous ne suivez aucun deal pour le moment
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('DealsInfluenceur')}
            >
              <Text style={styles.exploreButtonText}>Explorer les deals</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  dealInfo: {
    padding: 16,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  statusText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  dealDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  reward: {
    color: '#FF6B2E',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6B2E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 