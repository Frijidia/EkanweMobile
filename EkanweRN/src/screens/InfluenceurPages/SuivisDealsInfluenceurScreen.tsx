import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavbar } from './BottomNavbar';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SuivisDealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState("Tous");
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const filters = ["Tous", "Envoyé", "Accepté", "Refusé", "Terminé"];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const dealsRef = collection(db, "deals");

    const unsubscribe = onSnapshot(dealsRef, (snapshot) => {
      const myCandidatures: any[] = [];

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
    });

    return () => unsubscribe();
  }, []);

  const getProgressStyles = (status: string) => {
    const stages = ["Envoyé", "Accepté", "Terminé"];
    const currentStageIndex = stages.indexOf(status);

    return {
      Envoyé: { text: styles.progressTextActive },
      Accepté: { text: currentStageIndex >= 1 ? styles.progressTextActive : styles.progressTextInactive },
      completed: { text: currentStageIndex >= 2 ? styles.progressTextActive : styles.progressTextInactive },
      line1: currentStageIndex >= 1 ? styles.progressLineActive : styles.progressLineInactive,
      line2: currentStageIndex >= 2 ? styles.progressLineActive : styles.progressLineInactive,
    };
  };

  const handleChatPress = async (e: any, candidature: any) => {
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
        role: userData.role,
      });
    }
  };

  const filteredCandidatures = candidatures.filter(candidature => {
    const matchesFilter = selectedFilter === "Tous" || candidature.status === selectedFilter;
    const matchesSearch = candidature.dealInfo?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidature.dealInfo?.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suivi Deals</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationInfluenceur')}>
            <Image source={require('../../assets/clochenotification.png')} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('DealsInfluenceur')}>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={require('../../assets/loupe.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Recherche"
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={require('../../assets/menu.png')} style={styles.menuIcon} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {filters.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                selectedFilter === item && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === item && styles.filterButtonTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredCandidatures.length === 0 ? (
        <Text style={styles.emptyText}>Aucun deal trouvé</Text>
      ) : (
        <ScrollView style={styles.dealsList}>
          {filteredCandidatures.map((candidature, index) => {
            const progressStyles = getProgressStyles(candidature.status);
            return (
              <TouchableOpacity
                key={index}
                style={styles.dealCard}
                onPress={() => navigation.navigate('DealDetailsInfluenceur', { dealId: candidature.dealId })}
              >
                <Image
                  source={candidature.dealInfo?.imageUrl ? { uri: candidature.dealInfo.imageUrl } : require('../../assets/profile.png')}
                  style={styles.dealImage}
                />
                <View style={styles.dealContent}>
                  <View style={styles.dealHeader}>
                    <Text style={styles.dealTitle}>{candidature.dealInfo?.title}</Text>
                    <Text style={styles.dealId}>{candidature.dealId}</Text>
                    <Text style={styles.dealDescription} numberOfLines={1}>
                      {candidature.dealInfo?.description}
                    </Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressSteps}>
                      <Text style={progressStyles.Envoyé.text}>Envoyé</Text>
                      <View style={progressStyles.line1} />
                      <Text style={progressStyles.Accepté.text}>Accepté</Text>
                      <View style={progressStyles.line2} />
                      <Text style={progressStyles.completed.text}>Effectué</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.chatButton}
                        onPress={(e) => handleChatPress(e, candidature)}
                      >
                        <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={20} color="#14210F" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

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
    paddingTop: 48,
    backgroundColor: '#FFFFFF',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 12,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#14210F',
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
    borderWidth: 1,
    borderColor: '#14210F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 40,
    fontSize: 16,
  },
  dealsList: {
    padding: 16,
  },
  dealCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 20,
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
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  progressTextInactive: {
    fontSize: 12,
    color: '#666666',
  },
  progressLineActive: {
    height: 2,
    width: 40,
    backgroundColor: '#1A2C24',
    marginHorizontal: 4,
  },
  progressLineInactive: {
    height: 2,
    width: 40,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
    borderStyle: 'dashed',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#FF6B2E',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
});