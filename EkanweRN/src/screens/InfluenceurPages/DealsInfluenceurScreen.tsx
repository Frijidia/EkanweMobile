import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, doc, updateDoc, setDoc, arrayUnion, getDoc, getDocs, where } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { sendNotification } from "../../hooks/sendNotifications";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { BottomNavbar } from "./BottomNavbar";
// import * as Location from 'expo-location';

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
  interests?: string;
}

export const DealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  // const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    // fetchUserLocation();
    fetchDeals();
  }, []);

  // const fetchUserLocation = async () => {
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.log('Permission de localisation refusée');
  //       return;
  //     }

  //     const location = await Location.getCurrentPositionAsync({});
  //     setUserLocation({
  //       latitude: location.coords.latitude,
  //       longitude: location.coords.longitude
  //     });
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération de la position:", error);
  //   }
  // };

  const fetchDeals = async () => {
    try {
      const dealsRef = collection(db, "deals");
      const q = query(dealsRef, where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      
      const dealsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];

      // if (userLocation) {
      //   dealsData.sort((a, b) => {
      //     const distanceA = calculateDistance(
      //       userLocation.latitude,
      //       userLocation.longitude,
      //       a.location.latitude,
      //       a.location.longitude
      //     );
      //     const distanceB = calculateDistance(
      //       userLocation.latitude,
      //       userLocation.longitude,
      //       b.location.latitude,
      //       b.location.longitude
      //     );
      //     return distanceA - distanceB;
      //   });
      // }

      setDeals(dealsData);
      setLoadingPage(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des deals:", error);
      setLoadingPage(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

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

  const toggleSave = async (dealId: string) => {
    if (!user) return;
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
  };

  const filters = ["All", ...Array.from(new Set(deals.map((d) => d.interests).filter((interests): interests is string => interests !== undefined)))];
  const filteredDeals = selectedFilter === "All" ? deals : deals.filter((d) => d.interests === selectedFilter);
  const sortedByPopularity = [...filteredDeals].sort((a, b) => (b.candidatures?.length || 0) - (a.candidatures?.length || 0));
  const popularDeals = sortedByPopularity.slice(0, 5);
  const otherDeals = sortedByPopularity.slice(5);

  if (loadingPage) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('../../assets/ekanwesign.png')} style={styles.loadingImage} />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Deals</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationInfluenceur')}>
              <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('DealsInfluenceur')}>
              <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Image source={require('../../assets/loupe.png')} style={styles.searchIcon} />
            <TextInput placeholder="Recherche" placeholderTextColor="#999" style={styles.searchInput} />
            <Image source={require('../../assets/menu.png')} style={styles.menuIcon} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
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
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Section title="Populaire" deals={popularDeals} savedDeals={savedDeals} toggleSave={toggleSave} />
        <Section title="Autres deals" deals={otherDeals} savedDeals={savedDeals} toggleSave={toggleSave} />
      </ScrollView>
      <BottomNavbar />
    </View>
  );
};

interface SectionProps {
  title: string;
  deals: Deal[];
  savedDeals: string[];
  toggleSave: (dealId: string) => void;
}

const Section = ({ title, deals, savedDeals, toggleSave }: SectionProps) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.dealsContainer}>
        {deals.length > 0 ? (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              saved={savedDeals.includes(deal.id)}
              onSave={toggleSave}
            />
          ))
        ) : (
          <Text style={styles.noDealsText}>Aucun deal disponible</Text>
        )}
      </View>
    </View>
  );
};

interface DealCardProps {
  deal: Deal;
  saved: boolean;
  onSave: (dealId: string) => void;
}

const DealCard = ({ deal, saved, onSave }: DealCardProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const user = auth.currentUser;
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
    const user = auth.currentUser;
    if (!user) return alert("Veuillez vous connecter pour postuler.");
    setLoading(true);

    try {
      const dealRef = doc(db, "deals", deal.id);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) throw new Error("Deal introuvable.");

      const dealData = dealSnap.data();
      const candidatures = dealData?.candidatures || [];
      if (candidatures.some((cand: any) => cand.influenceurId === user.uid)) {
        alert("Vous avez déjà postulé à ce deal.");
        setLoading(false);
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
      alert("Votre candidature a été envoyée !");
      setStatus("Envoyé");
    } catch (err) {
      console.error("Erreur lors de la candidature :", err);
      alert("Une erreur est survenue lors de la candidature.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Veuillez vous connecter.");
    if (status) {
      navigation.navigate('DealDetailsInfluenceur', { dealId: deal.id });
    } else {
      navigation.navigate('DealsSeeMoreInfluenceur', { dealId: deal.id });
    }
  };

  return (
    <View style={styles.dealCard}>
      <View style={styles.dealImageContainer}>
        <Image
          source={deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/profile.png')}
          style={styles.dealImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.saveButton} onPress={() => onSave(deal.id)}>
          <Image
            source={saved ? require('../../assets/fullsave.png') : require('../../assets/save.png')}
            style={styles.saveIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.dealContent}>
        <Text style={styles.dealTitle}>{deal.title || "Titre du Deal"}</Text>
        <Text style={styles.dealDescription} numberOfLines={2}>
          {deal.description || "Description indisponible."}
        </Text>
        <View style={styles.buttonContainer}>
          {status ? (
            <TouchableOpacity
              disabled
              style={[
                styles.statusButton,
                status === "Terminé" && styles.completedButton,
                status === "Approbation" && styles.pendingButton
              ]}
            >
              <Text style={styles.statusButtonText}>{status}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={handleNavigation}
              >
                <Text style={styles.seeMoreButtonText}>Voir plus</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={loading}
                style={styles.dealButton}
                onPress={handleApplyToDeal}
              >
                <Text style={styles.dealButtonText}>
                  {loading ? "Envoi..." : "Dealer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingImage: {
    width: 64,
    height: 64,
  },
  loadingText: {
    marginTop: 16,
    color: '#14210F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 8,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#14210F',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#14210F',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14210F',
  },
  dealsContainer: {
    paddingHorizontal: 16,
  },
  noDealsText: {
    color: '#666',
    textAlign: 'center',
  },
  dealCard: {
    backgroundColor: '#1A2C24',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  dealImageContainer: {
    position: 'relative',
    aspectRatio: 16/9,
  },
  dealImage: {
    width: '100%',
    height: '100%',
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
  dealContent: {
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
    color: '#FFFFFF',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
  statusButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#15803d',
  },
  pendingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  seeMoreButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  seeMoreButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dealButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B2E',
    alignItems: 'center',
  },
  dealButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});