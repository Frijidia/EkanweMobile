import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/firebase';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DealsCommercant'>;

export const DealsPageCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<'Deals' | 'Influenceurs'>('Deals');
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});
  const [deals, setDeals] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleSave = (id: string) => {
    setSavedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderStars = (rating: number) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Text key={i} style={{ color: i <= rating ? '#FF6B2E' : '#ccc', fontSize: 16 }}>★</Text>
        ))}
      </View>
    );
  };

  const calculateAverageRating = (candidatures: any[] = []) => {
    const ratings = candidatures
      ?.map(c => typeof c.review?.rating === 'number' ? c.review.rating : parseInt(c.review?.rating))
      .filter((r: number) => !isNaN(r));

    if (!ratings.length) return 0;
    return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const dealsQuery = query(collection(db, 'deals'), where('merchantId', '==', user.uid));
      const influencersQuery = query(collection(db, 'users'), where('role', '==', 'influenceur'));

      const unsubscribeDeals = onSnapshot(dealsQuery, snapshot => {
        setDeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      const unsubscribeInfluencers = onSnapshot(influencersQuery, snapshot => {
        setInfluencers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        unsubscribeDeals();
        unsubscribeInfluencers();
      };
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deals</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput placeholder="Recherche" placeholderTextColor="#999" style={styles.input} />
      </View>

      <View style={styles.filterContainer}>
        {['Deals', 'Influenceurs'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setSelectedFilter(item as 'Deals' | 'Influenceurs')}
            style={[styles.filterButton, selectedFilter === item && styles.filterButtonActive]}
          >
            <Text style={selectedFilter === item ? styles.filterTextActive : styles.filterText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedFilter === 'Deals' ? (
        <>
          <TouchableOpacity style={styles.createDealButton} onPress={() => navigation.navigate('MerchantDetailCommercant')}>
            <Text style={styles.createDealText}>Faire un deal</Text>
          </TouchableOpacity>

          {deals.map((deal) => (
            <View key={deal.id} style={styles.card}>
              <Image source={{ uri: deal.imageUrl || 'https://via.placeholder.com/150' }} style={styles.dealImage} />
              <View style={styles.cardContent}>
                <Text style={styles.dealTitle}>{deal.title || 'Sans titre'}</Text>
                <Text style={styles.dealDesc}>{deal.description || '-'}</Text>
                {renderStars(calculateAverageRating(deal.candidatures))}
                <TouchableOpacity
                  onPress={() => navigation.navigate('DealCandidatesCommercant', { dealId: deal.id })}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Voir plus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
          {influencers.map((inf) => (
            <TouchableOpacity
              key={inf.id}
              onPress={() => navigation.navigate('ProfilPublicCommercant', { userId: inf.id })}
              style={styles.card}
            >
              <Image source={{ uri: inf.photoURL || 'https://via.placeholder.com/150' }} style={styles.dealImage} />
              <View style={styles.cardContent}>
                <Text style={styles.dealTitle}>{inf.pseudonyme || 'Influenceur'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5E7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5E7' },
  loadingText: { fontSize: 16, color: '#14210F' },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#14210F' },
  searchContainer: { paddingHorizontal: 16 },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  filterButtonActive: { backgroundColor: '#1A2C24' },
  filterText: { color: '#14210F' },
  filterTextActive: { color: '#fff' },
  createDealButton: {
    marginHorizontal: 16,
    backgroundColor: '#FF6B2E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createDealText: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#1A2C24',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dealImage: { width: '100%', height: 180 },
  cardContent: { padding: 12 },
  dealTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  dealDesc: { fontSize: 14, color: '#ccc', marginBottom: 8 },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF6B2E',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: { color: '#fff', fontSize: 14 },
});
