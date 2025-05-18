import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavbar } from './BottomNavbar';
//import { Deal } from '../../types/deal';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Deal {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: string;
  candidatures?: Array<{
    influenceurId: string;
    status: string;
    review?: {
      rating: number | string;
    };
  }>;
  merchantId: string;
  interest?: string;
}

export const DealsSeeMoreInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const dealsRef = collection(db, 'deals');
      const q = query(
        dealsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const dealsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];

      setDeals(dealsData);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Une erreur est survenue lors du chargement des deals');
      Alert.alert(
        'Erreur',
        'Impossible de charger les deals. Veuillez réessayer plus tard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetailsInfluenceur', { dealId: deal.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text style={styles.loadingText}>Chargement des deals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B2E" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeals}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FF6B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tous les Deals</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {deals.map((deal) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealCard}
            onPress={() => handleDealPress(deal)}
          >
            <Image
              source={{ uri: deal.imageUrl }}
              style={styles.dealImage}
              resizeMode="cover"
            />
            <View style={styles.dealInfo}>
              <Text style={styles.dealTitle}>{deal.title}</Text>
              <Text style={styles.dealDescription} numberOfLines={2}>
                {deal.description}
              </Text>
              <View style={styles.dealFooter}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#FF6B2E" />
                  {/*<Text style={styles.locationText}>{deal.location.name}</Text>*/}
                </View>
                <Text style={styles.dealId}>#{deal.id}</Text>
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
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealImage: {
    width: '100%',
    height: 200,
  },
  dealInfo: {
    padding: 16,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8,
  },
  dealDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF6B2E',
  },
  dealId: {
    fontSize: 12,
    color: '#FF6B2E',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1A2C24',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1A2C24',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#FF6B2E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});