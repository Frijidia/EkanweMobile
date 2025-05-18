import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { sendNotification } from "../../hooks/sendNotifications";
import Navbar from "../../components/Navbar";
import { Ionicons } from "@expo/vector-icons";
import profile from "../../assets/profile.png";
import sign from "../../assets/ekanwesign.png";
import fillplus from "../../assets/fillplus.png";

export default function DealCandidatesPageCommercant() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dealId } = route.params as { dealId: string };

  const [deal, setDeal] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dealRef = doc(db, "deals", dealId);
        const dealSnap = await getDoc(dealRef);
        const deals = await getDocs(collection(db, "deals"));

        // Calcule la moyenne
        const ratingMap: Record<string, { total: number; count: number }> = {};
        deals.forEach(doc => {
          const data = doc.data();
          data.candidatures?.forEach((cand: any) => {
            const uid = cand.influenceurId;
            const rating = cand.influreview?.rating;
            if (uid && typeof rating === "number") {
              if (!ratingMap[uid]) ratingMap[uid] = { total: 0, count: 0 };
              ratingMap[uid].total += rating;
              ratingMap[uid].count += 1;
            }
          });
        });

        const avgMap: Record<string, number> = {};
        Object.keys(ratingMap).forEach(uid => {
          avgMap[uid] = ratingMap[uid].total / ratingMap[uid].count;
        });
        setAverageRatings(avgMap);

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
        targetRoute: `/dealdetailinfluenceur/${dealId}`,
        fromUserId: auth.currentUser?.uid || "",
        type: "status_update",
      });

      setCandidates(prev => prev.map(c => (c.influenceurId === id ? { ...c, status } : c)));
    } catch (e) {
      console.error("updateStatus error:", e);
    } finally {
      setButtonLoading(null);
    }
  };

  const cancelContract = async (id: string) => {
    setButtonLoading(id + "cancel");
    try {
      const ref = doc(db, "deals", dealId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const updated = snap.data().candidatures.filter((c: any) => c.influenceurId !== id);
      await updateDoc(ref, { candidatures: updated });

      await sendNotification({
        toUserId: id,
        message: "Votre contrat a été résilié.",
        relatedDealId: dealId,
        targetRoute: `/dealdetailinfluenceur/${dealId}`,
        fromUserId: auth.currentUser?.uid || "",
        type: "contract_cancelled",
      });

      setCandidates(prev => prev.filter(c => c.influenceurId !== id));
    } catch (e) {
      console.error("cancelContract error:", e);
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
                  onPress={() => navigation.navigate("ProfilPublicCommercant", { userId: cand.influenceurId })}
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
                          <TouchableOpacity
                            onPress={() => cancelContract(cand.influenceurId)}
                            disabled={buttonLoading === cand.influenceurId + "cancel"}
                          >
                            <Text style={styles.cancelText}>
                              {buttonLoading === cand.influenceurId + "cancel" ? "..." : "RÉSILIER"}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {cand.status === "Refusé" && (
                        <Text style={styles.refusedText}>REFUSÉ</Text>
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
    backgroundColor: 'white'
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
