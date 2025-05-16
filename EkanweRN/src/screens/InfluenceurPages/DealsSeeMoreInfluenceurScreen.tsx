import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from '../components/BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DealsSeeMoreInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const categories = ['Tous', 'Restaurant', 'Mode', 'Beauté', 'Tech', 'Sport'];

  const deals = [
    {
      id: '1',
      title: 'Promotion Restaurant',
      description: 'Offre spéciale pour les influenceurs culinaires',
      image: require('../assets/deal1.png'),
      merchant: 'Le Petit Bistrot',
      category: 'Restaurant',
      reward: '50€',
    },
    {
      id: '2',
      title: 'Collection Mode',
      description: 'Découvrez notre nouvelle collection',
      image: require('../assets/deal2.png'),
      merchant: 'Fashion Store',
      category: 'Mode',
      reward: '100€',
    },
    // Ajoutez plus de deals ici
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Voir plus</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un deal..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {deals.map((deal) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealCard}
            onPress={() => navigation.navigate('DealDetailsInfluenceur', { dealId: deal.id })}
          >
            <Image source={deal.image} style={styles.dealImage} />
            <View style={styles.dealInfo}>
              <Text style={styles.dealTitle}>{deal.title}</Text>
              <Text style={styles.dealDescription}>{deal.description}</Text>
              <View style={styles.dealFooter}>
                <Text style={styles.merchantName}>{deal.merchant}</Text>
                <Text style={styles.reward}>{deal.reward}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#FF6B2E',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedCategoryText: {
    fontWeight: '600',
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
  dealTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
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
  merchantName: {
    color: '#fff',
    fontSize: 14,
  },
  reward: {
    color: '#FF6B2E',
    fontSize: 16,
    fontWeight: '600',
  },
}); 