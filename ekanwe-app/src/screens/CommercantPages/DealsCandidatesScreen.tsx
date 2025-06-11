import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { sendNotification, sendNotificationToToken } from "../../hooks/sendNotifications";
import { Navbar } from "./Navbar";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../types/navigation";
import profile from "../../assets/profile.png";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


export const DealCandidatesPageCommercant = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { dealId } = route.params as { dealId: string };

  const [deal, setDeal] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

  async function getAllDeals() {
    const snapshot = await getDocs(collection(db, "deals"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  function calculateAverageRatings(deals: any[]) {
    const ratingMap: Record<string, { total: number; count: number }> = {};
    deals.forEach((deal) => {
      deal.candidatures?.forEach((cand: any) => {
        const uid = cand.influenceurId;
        const rating = cand.influreview?.rating;
        if (uid && typeof rating === "number") {
          if (!ratingMap[uid]) {
            ratingMap[uid] = { total: rating, count: 1 };
          } else {
            ratingMap[uid].total += rating;
            ratingMap[uid].count += 1;
          }
        }
      });
    });
    const averageMap: Record<string, number> = {};
    for (const uid in ratingMap) {
      averageMap[uid] = ratingMap[uid].total / ratingMap[uid].count;
    }
    return averageMap;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!dealId) return;
        const dealRef = doc(db, "deals", dealId);
        const dealSnap = await getDoc(dealRef);
        const deals = await getAllDeals();
        const averages = calculateAverageRatings(deals);
        setAverageRatings(averages);

        if (dealSnap.exists()) {
          const data = dealSnap.data();
          setDeal(data);

          const fullCandidates = await Promise.all(
            (data.candidatures || []).map(async (cand: any) => {
              const userSnap = await getDoc(doc(db, "users", cand.influenceurId));
              if (!userSnap.exists()) return null;
              return {
                influenceurId: cand.influenceurId,
                status: cand.status,
                userInfo: userSnap.data(),
              };
            })
          );

          setCandidates(fullCandidates.filter(Boolean));
        }
      } catch (e) {
        console.error("Erreur fetch:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dealId]);

  const updateStatus = async (id: string, status: string) => {
    setButtonLoading(id + status);
    try {
      const ref = doc(db, "deals", dealId);
      const dealSnap = await getDoc(ref);
      if (!dealSnap.exists()) return;

      const data = dealSnap.data();
      const updated = data.candidatures.map((c: any) =>
        c.influenceurId === id ? { ...c, status } : c
      );

      await updateDoc(ref, { candidatures: updated });
      await sendNotification({
        toUserId: id,
        message: `Votre candidature a été ${status === "Accepté" ? "acceptée" : "refusée"}.`,
        relatedDealId: dealId,
        targetRoute: 'DealsDetailsInfluenceur',
        fromUserId: auth.currentUser?.uid || "",
        type: "status_update",
        dealId: dealId,
        receiverId: id,
      });
      const userSnap = await getDoc(doc(db, "users", id));
      const userToken = userSnap.exists() ? userSnap.data()?.expoPushToken : null;

      if (userToken) {
        await sendNotificationToToken(userToken,
          "Mise à jour de votre candidature",
          `Votre candidature a été ${status === "Accepté" ? "acceptée" : "refusée"}.`,
        );
      }

      setCandidates(prev => prev.map(c => (c.influenceurId === id ? { ...c, status } : c)));
    } catch (e) {
      console.error("updateStatus error:", e);
    } finally {
      setButtonLoading(null);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Text key={i} style={{ color: i < rating ? "#FF6B2E" : "#ccc", fontSize: 16 }}>★</Text>
    ));
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
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14210F" />
          </TouchableOpacity>
          <Text style={styles.title}>Candidats</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationsCommercant')}>
            <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {deal && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image
            source={{ uri: deal.imageUrl || Image.resolveAssetSource(profile).uri }}
            style={styles.dealImage}
            resizeMode="cover"
          />

          <View style={styles.contentContainer}>
            <Text style={styles.title}>{deal.title}</Text>
            <Text style={styles.location}>{deal.location || "Non défini"}</Text>
            <Text style={styles.description}>{deal.description}</Text>

            <Text style={styles.candidatesTitle}>Candidats</Text>
            {candidates.length === 0 ? (
              <Text style={styles.noCandidates}>Aucun candidat pour ce deal.</Text>
            ) : (
              candidates.map((cand) => (
                <TouchableOpacity
                  key={cand.influenceurId}
                  onPress={() => navigation.navigate("ProfilPublic", { userId: cand.influenceurId })}
                  style={styles.candidateCard}
                >
                  <View style={styles.candidateContent}>
                    <View style={styles.candidateInfo}>
                      <Image
                        source={{ uri: cand.userInfo?.photoURL || Image.resolveAssetSource(profile).uri }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.username}>{cand.userInfo?.pseudonyme}</Text>
                        <View style={styles.starsContainer}>{renderStars(Math.round(averageRatings[cand.influenceurId] || 0))}</View>
                      </View>
                    </View>
                    <View style={styles.buttonsContainer}>
                      {cand.status === "Envoyé" && (
                        <>
                          <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => updateStatus(cand.influenceurId, "Accepté")}
                            disabled={buttonLoading === cand.influenceurId + "Accepté"}
                          >
                            <Text style={styles.acceptButtonText}>
                              {buttonLoading === cand.influenceurId + "Accepté" ? "..." : "ACCEPTER"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.refuseButton}
                            onPress={() => updateStatus(cand.influenceurId, "Refusé")}
                            disabled={buttonLoading === cand.influenceurId + "Refusé"}
                          >
                            <Text style={styles.refuseButtonText}>
                              {buttonLoading === cand.influenceurId + "Refusé" ? "..." : "REFUSER"}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {cand.status === "Accepté" && (
                        <>
                          <Text style={styles.statusText}>EN COURS</Text>
                        </>
                      )}
                      {cand.status === "Refusé" && (
                        <>
                          <Text style={styles.refusedText}>REFUSÉ</Text>
                          <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => updateStatus(cand.influenceurId, "Accepté")}
                            disabled={buttonLoading === cand.influenceurId + "Accepté"}
                          >
                            <Text style={styles.acceptButtonText}>
                              {buttonLoading === cand.influenceurId + "Accepté" ? "..." : "Vous avez changé d'avis? Accepté le deal ;)"}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 70,
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    width: 24,
    height: 24,
  },
  scrollContent: {
    paddingBottom: 100
  },
  dealImage: {
    width: '100%',
    height: 200
  },
  contentContainer: {
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1A2C24'
  },
  location: {
    color: '#FF6B2E',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    color: '#1A2C24',
    marginBottom: 24
  },
  candidatesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 12
  },
  noCandidates: {
    color: '#666'
  },
  candidateCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12
  },
  candidateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16
  },
  username: {
    fontWeight: '600',
    color: '#1A2C24',
    marginBottom: 4
  },
  starsContainer: {
    flexDirection: 'row'
  },
  buttonsContainer: {
    alignItems: 'flex-end'
  },
  acceptButton: {
    backgroundColor: '#1A2C24',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 4
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12
  },
  refuseButton: {
    borderWidth: 1,
    borderColor: '#1A2C24',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  refuseButtonText: {
    color: '#1A2C24',
    fontSize: 12
  },
  statusText: {
    fontSize: 14,
    backgroundColor: '#E5E5E5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4
  },
  cancelText: {
    color: '#FF0000',
    fontSize: 12,
    textDecorationLine: 'underline'
  },
  refusedText: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: 12
  }
});
