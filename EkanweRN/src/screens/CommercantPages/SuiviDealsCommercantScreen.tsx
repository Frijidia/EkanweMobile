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
  const navigation = useNavigation();
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
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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

      <ScrollView style={styles.contentScroll}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>Aucune candidature trouvée</Text>
        ) : (
          filtered.map((c, index) => (
            <View key={index} style={styles.card}>
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
                          onPress={() => handleStatusChange(c.dealId, c.candidatureIndex, "Accepté")}
                          disabled={loadingIndex === c.candidatureIndex}
                        >
                          <Text style={styles.buttonText}>
                            {loadingIndex === c.candidatureIndex ? "..." : "Accepter"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.refuseButton}
                          onPress={() => handleStatusChange(c.dealId, c.candidatureIndex, "Refusé")}
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
                  <TouchableOpacity
                    onPress={() => navigation.navigate("DealDetailCommercant" as never, { 
                      dealId: c.dealId, 
                      influenceurId: c.influenceurId 
                    } as never)}
                  >
                    <Text style={styles.detailsButton}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
    backgroundColor: '#F5F5E7'
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
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  filterScroll: {
    paddingHorizontal: 16
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    minWidth: 'auto'
  },
  activeFilter: {
    backgroundColor: '#1A2C24'
  },
  inactiveFilter: {
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  filterText: {
    fontSize: 14
  },
  activeFilterText: {
    color: '#FFFFFF'
  },
  inactiveFilterText: {
    color: '#1A2C24'
  },
  contentScroll: {
    padding: 16,
    marginTop: 16
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start'
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },
  cardContent: {
    flex: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2C24'
  },
  cardDescription: {
    fontSize: 12,
    color: '#666'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  acceptButton: {
    backgroundColor: '#1A2C24',
    padding: 8,
    borderRadius: 4
  },
  refuseButton: {
    backgroundColor: '#FF0000',
    padding: 8,
    borderRadius: 4
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12
  },
  statusBadge: {
    backgroundColor: '#FF6B2E',
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20
  },
  detailsButton: {
    fontSize: 20,
    color: '#14210F'
  }
});
