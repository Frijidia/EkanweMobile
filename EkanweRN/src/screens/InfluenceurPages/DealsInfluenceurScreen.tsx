import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { BottomNavbar } from './BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const deals = [
    {
      id: '1',
      title: 'Promotion Restaurant',
      description: 'Offre spéciale pour les influenceurs culinaires',
      imageUrl: require('../../assets/photo.jpg'),
      interest: 'Restaurant'
    },
    {
      id: '2', 
      title: 'Collection Mode', 
      description: 'Découvrez notre nouvelle collection',
      imageUrl: require('../../assets/photo.jpg'),
      interest: 'Mode'
    },
    {
      id: '3',
      title: 'Beauté & Cosmétiques',
      description: 'Nouvelle gamme de produits bio',
      imageUrl: require('../../assets/photo.jpg'),
      interest: 'Beauté'
    }
  ];

  const filters = ['All', ...Array.from(new Set(deals.map(d => d.interest)))];
  const filteredDeals = selectedFilter === 'All' ? deals : deals.filter(d => d.interest === selectedFilter);
  const popularDeals = filteredDeals.slice(0, 2);
  const otherDeals = filteredDeals.slice(2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deals</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationInfluenceur')}>
            <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
          </TouchableOpacity>
          <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Image source={require('../../assets/loupe.png')} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Recherche"
          placeholderTextColor="#9CA3AF"
        />
        <Image source={require('../../assets/menu.png')} style={styles.menuIcon} />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Populaire</Text>
          {popularDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Autres deals</Text>
          {otherDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </View>
      </ScrollView>

      <BottomNavbar />
    </View>
  );
};

const DealCard = ({ deal }) => {
  const navigation = useNavigation<NavigationProp>();
  const [saved, setSaved] = useState(false);
  
  return (
    <View style={styles.dealCard}>
      <View style={styles.imageContainer}>
        <Image source={deal.imageUrl} style={styles.dealImage} />
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => setSaved(!saved)}
        >
          <Image 
            source={saved ? require('../../assets/fullsave.png') : require('../../assets/save.png')} 
            style={styles.saveIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.dealInfo}>
        <Text style={styles.dealTitle}>{deal.title}</Text>
        <Text style={styles.dealDescription}>{deal.description}</Text>
        <View style={styles.dealButtons}>
          <TouchableOpacity 
          style={styles.seeMoreButton}
          onPress={() => navigation.navigate('DealsSeeMoreInfluenceur', { deal })}
          >
            <Text style={styles.seeMoreText}>Voir plus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dealButton}>
            <Text style={styles.dealButtonText}>Dealer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14210F',
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  searchInput: {
    flex: 1,
    color: '#14210F',
  },
  filtersContainer: {
    height: 40, // Fixed height container
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  filterButton: {
    paddingHorizontal: 40,
    paddingVertical: 6,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#14210F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1A2C24',
  },
  filterText: {
    color: '#14210F',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#14210F',
  },
  dealCard: {
    backgroundColor: '#1A2C24',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  saveButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  saveIcon: {
    width: 24,
    height: 24,
  },
  dealInfo: {
    padding: 16,
  },
  dealTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dealDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 16,
  },
  dealButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  seeMoreButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  seeMoreText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dealButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B2E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  dealButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});