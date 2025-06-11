import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Candidature {
  dealId: string;
  dealInfo: any;
  candidatureIndex: number;
  status: string;
  influenceurId: string;
}

export const SuivisDealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState("Tous");
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filters = ["Tous", "Envoyé", "Accepté", "Refusé", "Terminé"];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError("Veuillez vous connecter pour voir vos candidatures");
      setLoading(false);
      return;
    }

    const dealsRef = collection(db, "deals");
    let unsubscribe: (() => void) | undefined;

    const fetchCandidatures = async () => {
      try {
        unsubscribe = onSnapshot(dealsRef, 
          (snapshot) => {
            const myCandidatures: Candidature[] = [];

            snapshot.forEach((docSnap) => {
              const deal = docSnap.data();
              const dealId = docSnap.id;
              const allCandidatures = deal.candidatures || [];

              allCandidatures.forEach((candidature: any, index: number) => {
                if (candidature.influenceurId === user.uid) {
                  myCandidatures.push({
                    ...candidature,
                    dealId,
                    dealInfo: deal,
                    candidatureIndex: index,
                  });
                }
              });
            });

            setCandidatures(myCandidatures);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error("Erreur lors de la récupération des candidatures:", error);
            setError("Erreur lors du chargement des candidatures");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Erreur lors de la configuration de l'écouteur:", error);
        setError("Erreur lors du chargement des candidatures");
        setLoading(false);
      }
    };

    fetchCandidatures();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const getProgressStyles = (status: string) => {
    const stages = ["Envoyé", "Accepté", "Terminé"];
    const currentStageIndex = stages.indexOf(status);

    return {
      Envoyé: { color: "#1A2C24", fontWeight: "bold" as const },
      Accepté: { color: currentStageIndex >= 1 ? "#1A2C24" : "#666666", fontWeight: currentStageIndex >= 1 ? "bold" as const : "normal" as const },
      completed: { color: currentStageIndex >= 2 ? "#1A2C24" : "#666666", fontWeight: currentStageIndex >= 2 ? "bold" as const : "normal" as const },
      line1: { backgroundColor: currentStageIndex >= 1 ? "#1A2C24" : "#CCCCCC" },
      line2: { backgroundColor: currentStageIndex >= 2 ? "#1A2C24" : "#CCCCCC" },
    };
  };

  const handleChatPress = async (e: any, candidature: Candidature) => {
    e.stopPropagation();
    const chatId = [auth.currentUser?.uid, candidature.dealInfo?.merchantId].sort().join("");
    const userRef = doc(db, "users", candidature.influenceurId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      navigation.navigate('ChatInfluenceur', {
        chatId,
        pseudonyme: userData.pseudonyme || "",
        photoURL: userData.photoURL || "",
        role: "influenceur"
      });
    }
  };

  const filteredCandidatures = candidatures
    .filter((c) => selectedFilter === "Tous" || c.status === selectedFilter)
    .filter((c) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        c.dealInfo?.title?.toLowerCase().includes(searchLower) ||
        c.dealInfo?.description?.toLowerCase().includes(searchLower) ||
        c.dealId.toLowerCase().includes(searchLower)
      );
    });

  const renderCandidature = ({ item: candidature }: { item: Candidature }) => {
    const progressStyles = getProgressStyles(candidature.status);

    return (
      <TouchableOpacity
        style={styles.dealCard}
        onPress={() => navigation.navigate('DealsDetailsInfluenceur', { dealId: candidature.dealId, influenceurId: auth.currentUser?.uid! })}
      >
        <Image
          source={candidature.dealInfo?.imageUrl ? { uri: candidature.dealInfo.imageUrl } : require('../../assets/profile.png')}
          style={styles.dealImage}
        />
        <View style={styles.dealContent}>
          <View style={styles.dealHeader}>
            <Text style={styles.dealTitle}>{candidature.dealInfo?.title}</Text>
            <Text style={styles.dealId}>{candidature.dealId}</Text>
            <Text style={styles.dealDescription} numberOfLines={2}>
              {candidature.dealInfo?.description}
            </Text>
          </View>

          <View style={styles.dealFooter}>
            <View style={styles.progressContainer}>
              <Icon
                name="send"
                size={16}
                color={progressStyles.Envoyé.color}
              />
              <View style={[styles.progressLine, progressStyles.line1]} />
              <Icon
                name="check-circle"
                size={16}
                color={progressStyles.Accepté.color}
              />
              <View style={[styles.progressLine, progressStyles.line2]} />
              <Icon
                name="check-all"
                size={16}
                color={progressStyles.completed.color}
              />
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={async () => {
                  const userRef = doc(db, "users", candidature.dealInfo?.merchantId);
                  const userSnap = await getDoc(userRef);
                  if (userSnap.exists()) {
                    const userData = userSnap.data();
                    navigation.navigate('Chat', {
                      chatId: [auth.currentUser?.uid, candidature.dealInfo?.merchantId].sort().join(""),
                      pseudonyme: userData?.displayName ?? 'Utilisateur introuvable',
                      photoURL: userData?.photoURL ?? '',
                      receiverId: userData?.uid,
                      role: 'influenceur'
                    })
                  }
                }}

              >
                <Icon name="message-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <Icon name="chevron-right" size={20} color="#14210F" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suivi Deals</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationInfluenceur')}>
            <Image
              source={require('../../assets/clochenotification.png')}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('DealsInfluenceur')}>
            <Image
              source={require('../../assets/ekanwesign.png')}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Image
            source={require('../../assets/loupe.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un deal..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#14210F" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement en cours...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredCandidatures.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun deal trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCandidatures}
          renderItem={renderCandidature}
          keyExtractor={(item) => item.dealId}
          contentContainerStyle={styles.dealsList}
        />
      )}

      <BottomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 70,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#14210F',
    fontSize: 14,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filterButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14210F',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1A2C24',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#14210F',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  dealsList: {
    padding: 16,
  },
  dealCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 16,
    overflow: 'hidden',
  },
  dealImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
    margin: 4,
  },
  dealContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
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
    color: '#666666',
    marginTop: 4,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLine: {
    height: 2,
    width: 40,
    marginHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#FF6B2E',
    padding: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B2E',
    textAlign: 'center',
  },
});