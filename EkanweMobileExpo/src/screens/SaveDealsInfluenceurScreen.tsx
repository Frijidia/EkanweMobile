import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from '../components/BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SaveDealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const savedDeals = [
    {
      id: '1',
      title: 'Promotion Restaurant',
      description: 'Offre spéciale pour les influenceurs culinaires',
      image: require('../assets/deal1.png'),
      merchant: 'Le Petit Bistrot',
      category: 'Restaurant',
      reward: '50€',
      savedDate: '2024-03-15',
    },
    {
      id: '2',
      title: 'Collection Mode',
      description: 'Découvrez notre nouvelle collection',
      image: require('../assets/deal2.png'),
      merchant: 'Fashion Store',
      category: 'Mode',
      reward: '100€',
      savedDate: '2024-03-14',
    },
    // Ajoutez plus de deals sauvegardés ici
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deals sauvegardés</Text>
      </View>

      <ScrollView style={styles.content}>
        {savedDeals.length > 0 ? (
          savedDeals.map((deal) => (
            <TouchableOpacity
              key={deal.id}
              style={styles.dealCard}
              onPress={() => navigation.navigate('DealDetailsInfluenceur', { dealId: deal.id })}
            >
              <Image source={deal.image} style={styles.dealImage} />
              <View style={styles.dealInfo}>
                <View style={styles.dealHeader}>
                  <Text style={styles.dealTitle}>{deal.title}</Text>
                  <TouchableOpacity style={styles.unsaveButton}>
                    <Icon name="bookmark" size={24} color="#FF6B2E" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.dealDescription}>{deal.description}</Text>
                <View style={styles.dealFooter}>
                  <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>{deal.merchant}</Text>
                    <Text style={styles.savedDate}>Sauvegardé le {deal.savedDate}</Text>
                  </View>
                  <Text style={styles.reward}>{deal.reward}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="bookmark-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore sauvegardé de deals
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
  unsaveButton: {
    padding: 4,
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
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  savedDate: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  reward: {
    color: '#FF6B2E',
    fontSize: 16,
    fontWeight: '600',
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