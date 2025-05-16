import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SuivisDealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState("Tous");
  const filters = ["Tous", "Envoyé", "Accepté", "Refusé", "Terminé"];

  const mockDeals = [
    {
      id: '1',
      title: 'Promotion Restaurant',
      description: 'Offre spéciale pour les influenceurs culinaires',
      imageUrl: require('../../assets/profile.png'),
      status: 'Accepté'
    },
    {
      id: '2',
      title: 'Collection Mode',
      description: 'Découvrez notre nouvelle collection',
      imageUrl: require('../../assets/profile.png'),
      status: 'Envoyé'
    }
  ];

  const getProgressStyles = (status: string) => {
    const stages = ["Envoyé", "Accepté", "Terminé"];
    const currentStageIndex = stages.indexOf(status);

    return {
      container: { color: currentStageIndex >= 0 ? "#1A2C24" : "#9CA3AF" },
      accepted: { color: currentStageIndex >= 1 ? "#1A2C24" : "#9CA3AF" },
      completed: { color: currentStageIndex >= 2 ? "#1A2C24" : "#9CA3AF" },
      line1: { backgroundColor: currentStageIndex >= 1 ? "#1A2C24" : "#9CA3AF" },
      line2: { backgroundColor: currentStageIndex >= 2 ? "#1A2C24" : "#9CA3AF" }
    };
  };

  const filteredDeals = selectedFilter === "Tous" 
    ? mockDeals
    : mockDeals.filter((deal) => deal.status === selectedFilter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suivi Deals</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity>
            <Icon name="bell" size={24} color="#1A2C24" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="home" size={24} color="#1A2C24" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={24} color="#1A2C24" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Recherche"
            placeholderTextColor="#9CA3AF"
          />
          <Icon name="menu" size={24} color="#1A2C24" />
        </View>

        <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
          {filters.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSelectedFilter(item)}
              style={[
                styles.filterButton,
                selectedFilter === item && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item && styles.filterTextActive
              ]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredDeals.length === 0 ? (
          <Text style={styles.emptyText}>Aucun deal trouvé</Text>
        ) : (
          filteredDeals.map((deal, index) => {
            const progressStyles = getProgressStyles(deal.status);

            return (
              <TouchableOpacity
                key={index}
                style={styles.dealCard}
              >
                <Image 
                  source={deal.imageUrl}
                  style={styles.dealImage}
                />
                <View style={styles.dealInfo}>
                  <View style={styles.dealHeader}>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    <Text style={styles.dealId}>{deal.id}</Text>
                    <Text style={styles.dealDescription}>{deal.description}</Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressTracker}>
                      <Icon 
                        name="send" 
                        size={24} 
                        color={progressStyles.container.color}
                      />
                      <View style={[styles.progressLine, progressStyles.line1]} />
                      <Icon 
                        name="check-circle" 
                        size={24} 
                        color={progressStyles.accepted.color}
                      />
                      <View style={[styles.progressLine, progressStyles.line2]} />
                      <Icon 
                        name="flag-checkered" 
                        size={24} 
                        color={progressStyles.completed.color}
                      />
                    </View>
                    <TouchableOpacity style={styles.chatButton}>
                      <Icon name="message" size={12} color="#fff" />
                    </TouchableOpacity>
                    <Icon name="chevron-right" size={24} color="#14210F" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#14210F',
    borderRadius: 8,
    padding: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#14210F',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14210F',
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#1A2C24',
  },
  filterText: {
    color: '#14210F',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
  },
  dealCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#14210F',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 16,
    alignItems: 'flex-start',
  },
  dealImage: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
  },
  dealInfo: {
    flex: 1,
    padding: 4,
  },
  dealHeader: {
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  dealId: {
    fontSize: 12,
    color: '#FF6B2E',
    fontWeight: 'bold',
  },
  dealDescription: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressTracker: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressLine: {
    height: 2,
    width: 20,
    marginHorizontal: 4,
  },
  chatButton: {
    backgroundColor: '#FF6B2E',
    padding: 8,
    borderRadius: 9999,
    marginLeft: 8,
  },
});