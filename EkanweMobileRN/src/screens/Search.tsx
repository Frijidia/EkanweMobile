import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

type SearchResult = {
  id: string;
  type: 'influencer' | 'campaign';
  title: string;
  description: string;
  image: any;
  category?: string;
  followers?: string;
  budget?: string;
};

export const Search = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'influencers' | 'campaigns'>('influencers');

  // Données de test
  const searchResults: SearchResult[] = [
    {
      id: '1',
      type: 'influencer',
      title: 'Sophie Martin',
      description: 'Influenceuse mode et beauté',
      image: require('../assets/influencer1.png'),
      category: 'Mode & Beauté',
      followers: '50K',
    },
    {
      id: '2',
      type: 'campaign',
      title: 'Campagne Instagram',
      description: 'Promotion de notre nouvelle collection',
      image: require('../assets/deal1.png'),
      budget: '500€',
    },
  ];

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => {
        if (item.type === 'influencer') {
          navigation.navigate('Profile', { userId: item.id });
        } else {
          navigation.navigate('CampaignDetails', { campaignId: item.id });
        }
      }}
    >
      <Image source={item.image} style={styles.resultImage} />
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultDescription}>{item.description}</Text>
        {item.type === 'influencer' ? (
          <View style={styles.influencerInfo}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.followers}>{item.followers} followers</Text>
          </View>
        ) : (
          <Text style={styles.budget}>{item.budget}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'influencers' && styles.activeTab]}
          onPress={() => setActiveTab('influencers')}
        >
          <Text style={[styles.tabText, activeTab === 'influencers' && styles.activeTabText]}>
            Influenceurs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'campaigns' && styles.activeTab]}
          onPress={() => setActiveTab('campaigns')}
        >
          <Text style={[styles.tabText, activeTab === 'campaigns' && styles.activeTabText]}>
            Campagnes
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults.filter(
          (result) =>
            result.type === activeTab.slice(0, -1) &&
            (result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              result.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
      />
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    color: 'white',
    fontSize: 24,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2A3C34',
    borderRadius: 8,
    padding: 12,
    color: 'white',
  },
  tabs: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007AFF',
  },
  resultsList: {
    padding: 20,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#2A3C34',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  resultImage: {
    width: 100,
    height: 100,
  },
  resultContent: {
    flex: 1,
    padding: 12,
  },
  resultTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  influencerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    color: '#007AFF',
    fontSize: 12,
  },
  followers: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  budget: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 