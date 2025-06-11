import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, doc, updateDoc, setDoc, arrayUnion, getDoc, getDocs, where } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { sendNotification, sendNotificationToToken } from "../../hooks/sendNotifications";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { BottomNavbar } from "./BottomNavbar";
import { Ionicons } from '@expo/vector-icons';
// import * as Location from 'expo-location';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Deal {
  id: string;
  title: string;
  description: string;
  interests?: string;
  locationName?: string;
  candidatures?: any[];
  status: string;
  imageUrl?: string;
  merchantId: string;
  validUntil: string;
  typeOfContent: string[];
  conditions: string;
}

export const DealsInfluenceurScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState("Tous");
  const [selectedCountry, setSelectedCountry] = useState("Tous");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showCountriesModal, setShowCountriesModal] = useState(false);

  const user = auth.currentUser;
  const navigation = useNavigation<NavigationProp>();

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

      setDeals(dealsData);
      setLoadingPage(false);
    } catch (error) {
      console.error('Erreur lors du chargement des deals:', error);
      setLoadingPage(false);
    }
  };

  const toggleSave = async (dealId: string) => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const data = { savedDeals: savedDeals.includes(dealId) 
      ? savedDeals.filter(id => id !== dealId)
      : [...savedDeals, dealId]
    };

    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, data);
      } else {
        await setDoc(ref, data);
      }
      setSavedDeals(data.savedDeals);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Fonction de normalisation des noms de pays
  const normalizeCountryName = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
      .replace(/\s+/g, ' ') // Normalise les espaces
      .replace(/^\w/, c => c.toUpperCase()); // Première lettre en majuscule
  };

  // Get unique list of interests and ensure they are strings
  // Fonction pour extraire les intérêts quel que soit le format
  const extractInterests = (interests: any): string[] => {
    if (!interests) return [];
    
    // Si c'est une chaîne de caractères
    if (typeof interests === 'string') {
      // Essayer de parser comme JSON au cas où c'est une chaîne JSON
      try {
        const parsed = JSON.parse(interests);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') return [parsed];
      } catch (e) {
        // Si ce n'est pas du JSON valide, traiter comme une chaîne simple
        return interests.split(/(?=[A-Z])|,|\s+/).filter(Boolean).map(s => s.trim());
      }
    }
    
    // Si c'est un tableau
    if (Array.isArray(interests)) {
      return interests.map(i => String(i).trim()).filter(Boolean);
    }
    
    return [];
  };

  const allInterests = deals.reduce((acc: string[], deal) => {
    console.log('Processing deal:', deal.id, deal.interests);
    const dealInterests = extractInterests(deal.interests);
    console.log('Extracted interests:', dealInterests);
    return [...acc, ...dealInterests];
  }, []);

// Obtenir la liste unique des intérêts et ajouter "Tous" au début
  const interests = ["Tous", ...Array.from(new Set(allInterests))].filter(Boolean);

  // Get unique list of countries and normalize country names, without "Tous"
  const countries = Array.from(new Set(deals.map(deal => {
    if (!deal.locationName) return "Non spécifié";
    const parts = deal.locationName.split(", ");
    const country = parts.length > 1 ? parts[1] : parts[0];
    return normalizeCountryName(country);
  }).filter(Boolean))).sort();

  // Add "Tous" back at the beginning of the sorted list
  const countriesWithTous = ["Tous", ...countries];

  // Filter deals by search query, interest and country
  const filteredDeals = deals.filter(deal => {
    // Filtre par recherche
    const matchesSearch = searchQuery === "" || 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtre par intérêts
    const dealInterests = extractInterests(deal.interests);
    const matchesInterest = selectedFilter === "Tous" || dealInterests.includes(selectedFilter);
    
    const dealCountry = deal.locationName ? 
      normalizeCountryName(deal.locationName.split(", ").pop() || "") : 
      "Non spécifié";
    const matchesCountry = selectedCountry === "Tous" || dealCountry === selectedCountry;
    
    return matchesSearch && matchesInterest && matchesCountry;
  });

  // Sort by popularity and split into sections
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
            <TextInput 
              placeholder="Recherche" 
              placeholderTextColor="#999" 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Image source={require('../../assets/menu.png')} style={styles.menuIcon} />
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={styles.filterSelector} 
            onPress={() => setShowInterestsModal(true)}
          >
            <Text style={styles.filterLabel}>Intérêts: {selectedFilter}</Text>
            <Ionicons name="chevron-down" size={20} color="#14210F" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterSelector} 
            onPress={() => setShowCountriesModal(true)}
          >
            <Text style={styles.filterLabel}>Pays: {selectedCountry}</Text>
            <Ionicons name="chevron-down" size={20} color="#14210F" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showInterestsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInterestsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sélectionner un intérêt</Text>
                <TouchableOpacity onPress={() => setShowInterestsModal(false)}>
                  <Text style={styles.closeButton}>Fermer</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {interests.map((interest, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalOption,
                      selectedFilter === interest && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedFilter(interest);
                      setShowInterestsModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      selectedFilter === interest && styles.modalOptionTextSelected
                    ]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCountriesModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCountriesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sélectionner un pays</Text>
                <TouchableOpacity onPress={() => setShowCountriesModal(false)}>
                  <Text style={styles.closeButton}>Fermer</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {countriesWithTous.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalOption,
                      selectedCountry === country && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedCountry(country);
                      setShowCountriesModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      selectedCountry === country && styles.modalOptionTextSelected
                    ]}>
                      {country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {filteredDeals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun deal disponible pour ces filtres</Text>
          </View>
        ) : (
          <>
            <Section title="Populaire" deals={popularDeals} savedDeals={savedDeals} toggleSave={toggleSave} />
            <Section title="Autres deals" deals={otherDeals} savedDeals={savedDeals} toggleSave={toggleSave} />
          </>
        )}
      </ScrollView>
      <BottomNavbar />
    </View>
  );
};

interface SectionProps {
  title: string;
  deals: Deal[];
  savedDeals: string[];
  toggleSave: (dealId: string) => Promise<void>;
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
        targetRoute: 'DealCandidatesCommercant',
        dealId: deal.id,
        receiverId: deal.merchantId,
      });
      const userSnap = await getDoc(doc(db, "users", deal.merchantId));
      const userToken = userSnap.exists() ? userSnap.data()?.expoPushToken : null;

      if (userToken) {
        await sendNotificationToToken(userToken,
          "Nouvelle candidature !",
          `Un influenceur a postulé à votre deal !`,
        );
      }
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
    navigation.navigate('DealsSeeMoreInfluenceur', { dealId: deal.id });
  };

  return (
    <TouchableOpacity style={styles.dealCard} onPress={handleNavigation}>
      <View style={styles.dealImageContainer}>
        <Image
          source={deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/profile.png')}
          style={styles.dealImage}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={(e) => {
            e.stopPropagation();
            onSave(deal.id);
          }}
        >
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
              onPress={(e) => {
                e.stopPropagation();
                const user = auth.currentUser;
                navigation.navigate('DealsDetailsInfluenceur', {dealId: deal.id, influenceurId: user?.uid!});
              }}
            >
              <Text style={styles.statusButtonText}>{status}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleNavigation();
                }}
              >
                <Text style={styles.seeMoreButtonText}>Voir plus</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={loading}
                style={styles.dealButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleApplyToDeal();
                }}
              >
                <Text style={styles.dealButtonText}>
                  {loading ? "Envoi..." : "Dealer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#14210F',
  },
  loadingImage: {
    width: 64,
    height: 64,
  },
  loadingText: {
    marginTop: 16,
    color: '#FFFFFF',
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
    padding: 5,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#14210F',
    fontSize: 16,
    paddingVertical: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14210F',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: '#14210F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F5F5E7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#14210F',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14210F',
  },
  closeButton: {
    color: '#FF6B2E',
    fontSize: 16,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 33, 15, 0.1)',
  },
  modalOptionSelected: {
    backgroundColor: '#14210F',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#14210F',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
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
    aspectRatio: 16 / 9,
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
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});