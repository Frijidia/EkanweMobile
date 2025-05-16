
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SaveDealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);

  const savedDeals = [
    {
      id: '1',
      title: 'Promotion Restaurant',
      description: 'Offre spéciale pour les influenceurs culinaires',
      imageUrl: require('../../assets/photo.jpg'),
      status: 'Envoyé',
      merchantId: 'merchant1'
    },
    {
      id: '2', 
      title: 'Collection Mode',
      description: 'Découvrez notre nouvelle collection',
      imageUrl: require('../../assets/photo.jpg'),
      status: 'Accepté',
      merchantId: 'merchant2'
    }
  ];

  const renderStatusButton = (status: string) => {
    const common = [styles.statusButton];
    if (status === "Envoyé") return <TouchableOpacity disabled style={[...common, styles.statusGray]}><Text style={styles.buttonText}>Candidature envoyée</Text></TouchableOpacity>;
    if (status === "Accepté") return <TouchableOpacity disabled style={[...common, styles.statusBlue]}><Text style={styles.buttonText}>Accepté</Text></TouchableOpacity>;
    if (status === "Approbation") return <TouchableOpacity disabled style={[...common, styles.statusYellow]}><Text style={styles.buttonText}>En attente validation</Text></TouchableOpacity>;
    if (status === "Terminé") return <TouchableOpacity disabled style={[...common, styles.statusGreen]}><Text style={styles.buttonText}>Mission terminée</Text></TouchableOpacity>;
    return (
      <TouchableOpacity style={[...common, styles.statusOrange]}>
        <Text style={styles.buttonText}>Dealer</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enregistrés</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity>
            <Icon name="bell" size={24} color="#1A2C24" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={24} color="#1A2C24" style={styles.searchIcon} />
          <TextInput 
            placeholder="Recherche"
            style={styles.searchInput}
          />
          <Icon name="menu" size={24} color="#1A2C24" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {savedDeals.length === 0 ? (
          <Text style={styles.emptyText}>Aucun deal enregistré.</Text>
        ) : (
          <View style={styles.dealsContainer}>
            {savedDeals.map((deal, index) => (
              <View key={index} style={styles.dealCard}>
                <View style={styles.imageContainer}>
                  <Image
                    source={deal.imageUrl}
                    style={styles.dealImage}
                  />
                  <TouchableOpacity style={styles.saveButton}>
                    <Icon name="bookmark" size={20} color="#FF6B2E" />
                  </TouchableOpacity>
                </View>
                <View style={styles.dealInfo}>
                  <Text style={styles.dealTitle}>{deal.title}</Text>
                  <Text style={styles.dealDescription}>{deal.description}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.seeMoreButton}>
                      <Text style={styles.seeMoreText}>Voir plus</Text>
                    </TouchableOpacity>
                    {renderStatusButton(deal.status)}
                  </View>
                </View>
              </View>
            ))}
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
    backgroundColor: '#F5F5E7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingText: {
    color: '#14210F',
    fontSize: 16,
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
  icon: {
    width: 24,
    height: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#14210F',
  },
  content: {
    flex: 1,
  },
  dealsContainer: {
    padding: 16,
    gap: 24,
  },
  dealCard: {
    backgroundColor: '#1A2C24',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
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
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dealDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  seeMoreButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 8,
  },
  seeMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  statusButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusGray: {
    backgroundColor: '#6B7280',
  },
  statusBlue: {
    backgroundColor: '#008000',
  },
  statusYellow: {
    backgroundColor: '#F59E0B',
  },
  statusGreen: {
    backgroundColor: '#047857',
  },
  statusOrange: {
    backgroundColor: '#FF6B2E',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
  }
});