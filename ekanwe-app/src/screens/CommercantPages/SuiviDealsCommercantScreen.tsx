import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, doc, getDoc, onSnapshot, updateDoc, where, query } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { MessageCircle } from "lucide-react-native";
import { Navbar } from "./Navbar";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const filters = ["Tous", "Envoyé", "Accepté", "Approbation", "Terminé", "Refusé"];

interface Candidature {
  status: string;
  dealId: string;
  candidatureIndex: number;
  influenceurId: string;
  dealInfo?: {
    imageUrl?: string;
    title?: string;
    description?: string;
  };
}

export const SuiviDealsCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState("Tous");
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "deals"), where("merchantId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: Candidature[] = [];
      snapshot.forEach((docSnap) => {
        const deal = docSnap.data();
        const dealId = docSnap.id;
        (deal.candidatures || []).forEach((cand: any, idx: number) => {
          results.push({
            ...cand,
            candidatureIndex: idx,
            dealId,
            dealInfo: deal,
          });
        });
      });
      setCandidatures(results);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (dealId: string, index: number, newStatus: string) => {
    try {
      setLoadingIndex(index);
      const dealRef = doc(db, "deals", dealId);
      const snap = await getDoc(dealRef);
      if (snap.exists()) {
        const data = snap.data();
        data.candidatures[index].status = newStatus;
        await updateDoc(dealRef, { candidatures: data.candidatures });
      }
      setLoadingIndex(null);
    } catch (err) {
      console.error(err);
      setLoadingIndex(null);
    }
  };

  const filtered = selectedFilter === "Tous" ? candidatures : candidatures.filter(c => c.status === selectedFilter);

  const getLabel = (status: string) => {
    switch (status) {
      case "Approbation": return "En attente de validation";
      case "Terminé": return "Mission terminée";
      case "Accepté": return "En cours ...";
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suivi Candidatures</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationsCommercant')}>
            <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSelectedFilter(item)}
              style={[
                styles.filterButton,
                selectedFilter === item ? styles.activeFilter : styles.inactiveFilter
              ]}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item ? styles.activeFilterText : styles.inactiveFilterText
              ]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.contentScroll}
        contentContainerStyle={styles.contentScrollContent}
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>Aucune candidature trouvée</Text>
        ) : (
          filtered.map((c, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => navigation.navigate("DealsDetailsCommercant" as never, { 
                dealId: c.dealId, 
                influenceurId: c.influenceurId 
              } as never)}
            >
              <View style={styles.card}>
                <Image source={{ uri: c.dealInfo?.imageUrl }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{c.dealInfo?.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={1}>{c.dealInfo?.description}</Text>
                  <View style={styles.cardActions}>
                    <View style={styles.actionButtons}>
                      {c.status === "Envoyé" ? (
                        <>
                          <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleStatusChange(c.dealId, c.candidatureIndex, "Accepté");
                            }}
                            disabled={loadingIndex === c.candidatureIndex}
                          >
                            <Text style={styles.buttonText}>
                              {loadingIndex === c.candidatureIndex ? "..." : "Accepter"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.refuseButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleStatusChange(c.dealId, c.candidatureIndex, "Refusé");
                            }}
                            disabled={loadingIndex === c.candidatureIndex}
                          >
                            <Text style={styles.buttonText}>
                              {loadingIndex === c.candidatureIndex ? "..." : "Refuser"}
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <Text style={styles.statusBadge}>{getLabel(c.status)}</Text>
                      )}
                    </View>
                    <Text style={styles.detailsButton}>→</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <Navbar />
    </View>
  );
}

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
    backgroundColor: '#F5F5E7'
  },
  loadingText: {
    marginTop: 16,
    color: '#14210F'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#F5F5E7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F'
  },
  icon: {
    width: 24,
    height: 24,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    height: 36,
    marginRight: 8,
    borderRadius: 18,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#14210F',
  },
  activeFilter: {
    backgroundColor: '#1A2C24',
    borderColor: '#1A2C24',
  },
  inactiveFilter: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterText: {
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  inactiveFilterText: {
    color: '#14210F',
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
    margin: 4,
  },
  cardContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#1A2C24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  refuseButton: {
    backgroundColor: '#FF6B2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#1A2C24',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsButton: {
    fontSize: 24,
    color: '#14210F',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    marginTop: 40,
  },
});
