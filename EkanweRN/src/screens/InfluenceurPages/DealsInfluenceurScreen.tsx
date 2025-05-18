import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { BottomNavbar } from './BottomNavbar';
import { 
  collection, 
  query, 
  doc, 
  updateDoc, 
  setDoc, 
  arrayUnion, 
  getDoc, 
  getDocs, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { sendNotification } from '../../hooks/sendNotifications';
//import { getCurrentPosition, configureStatusBar } from '../../utils/capacitorUtils';

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

interface ErrorState {
  message: string;
  type: 'network' | 'auth' | 'location' | 'data' | 'unknown';
}

interface DealCardProps {
  deal: Deal;
  saved: boolean;
  onSave: (dealId: string) => void;
}

export const DealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  
  const user = auth.currentUser;
  
  // Refs to scroll to sections
  const popularRef = useRef(null);
  const otherRef = useRef(null);

  useEffect(() => {
    //configureStatusBar();
    fetchUserLocation();
    fetchDeals();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      const ref = doc(db, "saveDeal", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSavedDeals(snap.data()?.deals || []);
      }
    };
    fetchSaved();
  }, [user]);

  const fetchUserLocation = async () => {
    try {
      //const position = await getCurrentPosition();
      //setUserLocation(position);
    } catch (error) {
      console.error("Erreur lors de la récupération de la position:", error);
      setError({
        message: "Impossible d'accéder à votre position. Les deals ne seront pas triés par distance.",
        type: 'location'
      });
    }
  };

  const fetchDeals = async () => {
    try {
      setLoadingPage(true);
      setError(null);
      
      const dealsRef = collection(db, "deals");
      const q = query(dealsRef, where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setDeals([]);
        setLoadingPage(false);
        return;
      }

      const dealsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];

      if (userLocation) {
        dealsData.sort((a, b) => {
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.location.latitude,
            a.location.longitude
          );
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.location.latitude,
            b.location.longitude
          );
          return distanceA - distanceB;
        });
      }

      setDeals(dealsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des deals:", error);
      setError({
        message: "Impossible de charger les deals. Veuillez réessayer plus tard.",
        type: 'data'
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toggleSave = async (dealId: string) => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Veuillez vous connecter pour sauvegarder des deals.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setError(null);
      const ref = doc(db, "saveDeal", user.uid);
      const isSaved = savedDeals.includes(dealId);
      const updated = isSaved
        ? savedDeals.filter((id) => id !== dealId)
        : [...savedDeals, dealId];
      
      setSavedDeals(updated);

      const data = { deals: updated };
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, data);
      } else {
        await setDoc(ref, data);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du deal:", error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder le deal. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    }
  };

  const filters = ["All", ...Array.from(new Set(deals.map((d) => d.interest).filter((interest): interest is string => interest !== undefined)))];
  const filteredDeals = selectedFilter === "All" ? deals : deals.filter((d) => d.interest === selectedFilter);
  
  // Trier les deals par popularité (nombre de candidatures)
  const sortedByPopularity = [...filteredDeals].sort((a, b) => (b.candidatures?.length || 0) - (a.candidatures?.length || 0));
  const popularDeals = sortedByPopularity.slice(0, 5);
  const otherDeals = sortedByPopularity.slice(5);

  if (loadingPage) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14210F" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Une erreur est survenue</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            fetchDeals();
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <View style={styles.section} ref={popularRef}>
          <Text style={styles.sectionTitle}>Populaire</Text>
          {popularDeals.length > 0 ? (
            popularDeals.map(deal => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                saved={savedDeals.includes(deal.id)}
                onSave={() => toggleSave(deal.id)} 
              />
            ))
          ) : (
            <Text style={styles.noDealsText}>Aucun deal disponible</Text>
          )}
        </View>

        <View style={styles.section} ref={otherRef}>
          <Text style={styles.sectionTitle}>Autres deals</Text>
          {otherDeals.length > 0 ? (
            otherDeals.map(deal => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                saved={savedDeals.includes(deal.id)}
                onSave={() => toggleSave(deal.id)} 
              />
            ))
          ) : (
            <Text style={styles.noDealsText}>Aucun deal disponible</Text>
          )}
        </View>
      </ScrollView>

      <BottomNavbar />
    </View>
  );
};

const DealCard: React.FC<DealCardProps> = ({ deal, saved, onSave }) => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const user = auth.currentUser;
  
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      const dealRef = doc(db, "deals", deal.id);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) return;
      const dealData = dealSnap.data();
      const found = dealData?.candidatures?.find((c: any) => c.influenceurId === user.uid);
      if (found) {
        setStatus(found.status);
      }
    };
    fetchStatus();
  }, [deal.id]);
  
  const handleApplyToDeal = async () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Veuillez vous connecter pour postuler à un deal.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setError(null);
      const dealRef = doc(db, "deals", deal.id);
      const dealSnap = await getDoc(dealRef);
      
      if (!dealSnap.exists()) {
        throw new Error("Deal introuvable");
      }

      const dealData = dealSnap.data();
      const candidatures = dealData?.candidatures || [];
      
      if (candidatures.some((cand: any) => cand.influenceurId === user.uid)) {
        Alert.alert(
          "Déjà postulé",
          "Vous avez déjà postulé à ce deal.",
          [{ text: "OK" }]
        );
        return;
      }

      const newCandidature = { influenceurId: user.uid, status: "Envoyé" };
      await updateDoc(dealRef, { candidatures: arrayUnion(newCandidature) });

      await sendNotification({
        toUserId: deal.merchantId,
        fromUserId: user.uid,
        message: "Un influenceur a postulé à votre deal !",
        type: "application",
        relatedDealId: deal.id,
        targetRoute: `/dealcandidatescommercant/${deal.id}`,
      });

      const chatId = [user.uid, deal.merchantId].sort().join("");
      const message = {
        senderId: user.uid,
        text: `Bonjour, je suis intéressé par le deal "${deal.title}".`,
        createdAt: new Date(),
      };

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, { messages: [message] });
      } else {
        await updateDoc(chatRef, { messages: arrayUnion(message) });
      }

      const updateUserChats = async (uid: string, receiverId: string, read: boolean) => {
        const ref = doc(db, "userchats", uid);
        const snap = await getDoc(ref);
        const newChat = { chatId, receiverId, lastMessage: message.text, updatedAt: Date.now(), read };
        if (snap.exists()) {
          const data = snap.data();
          const chats = data.chats || [];
          const idx = chats.findIndex((c: any) => c.chatId === chatId);
          if (idx !== -1) chats[idx] = newChat;
          else chats.push(newChat);
          await updateDoc(ref, { chats });
        } else {
          await setDoc(ref, { chats: [newChat] });
        }
      };

      await updateUserChats(user.uid, deal.merchantId, true);
      await updateUserChats(deal.merchantId, user.uid, false);
      Alert.alert(
        "Succès",
        "Votre candidature a été envoyée avec succès !",
        [{ text: "OK" }]
      );
      setStatus("Envoyé");
    } catch (error) {
      console.error("Erreur lors de la candidature :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    }
  };

  const handleNavigation = () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Veuillez vous connecter pour voir les détails du deal.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (status) {
      navigation.navigate('DealDetailsInfluenceur', { dealId: deal.id });
    } else {
      navigation.navigate('DealsSeeMoreInfluenceur', { dealId: deal.id });
    }
  };
  
  return (
    <View style={styles.dealCard}>
      <View style={styles.imageContainer}>
        <Image 
          source={deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/photo.jpg')} 
          style={styles.dealImage} 
        />
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => onSave(deal.id)}
        >
          <Image 
            source={saved ? require('../../assets/fullsave.png') : require('../../assets/save.png')} 
            style={styles.saveIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.dealInfo}>
        <Text style={styles.dealTitle}>{deal.title || "Titre du Deal"}</Text>
        <Text style={styles.dealDescription}>{deal.description || "Description indisponible."}</Text>
        
        {status ? (
          <TouchableOpacity 
            style={[
              styles.statusButton,
              status === "Terminé" ? styles.statusTermine :
              status === "Approbation" ? styles.statusApprobation : 
              styles.statusEnvoye
            ]}
            disabled={true}
          >
            <Text style={styles.statusText}>{status}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.dealButtons}>
            <TouchableOpacity 
              style={styles.seeMoreButton}
              onPress={handleNavigation}
            >
              <Text style={styles.seeMoreText}>Voir plus</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.dealButton, loading && styles.dealButtonDisabled]}
              onPress={handleApplyToDeal}
              disabled={loading}
            >
              <Text style={styles.dealButtonText}>{loading ? "Envoi..." : "Dealer"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    marginTop: 10,
    color: '#14210F',
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
    height: 40,
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
  noDealsText: {
    color: '#777',
    fontSize: 14,
    padding: 10,
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
  dealButtonDisabled: {
    backgroundColor: '#FF6B2E80',
  },
  dealButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  statusEnvoye: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusApprobation: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusTermine: {
    backgroundColor: '#2F855A',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5E7',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B2E',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#14210F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B2E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});