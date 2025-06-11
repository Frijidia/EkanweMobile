import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Linking, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { sendNotification, sendNotificationToToken } from "../../hooks/sendNotifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DealsDetailsCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { dealId, influenceurId } = route.params as { dealId: string; influenceurId: string };

  const [deal, setDeal] = useState<any>(null);
  const [candidature, setCandidature] = useState<any>(null);
  const [influenceur, setInfluenceur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!dealId) return;
        const dealRef = doc(db, "deals", dealId);
        const dealSnap = await getDoc(dealRef);
        if (influenceurId) {
          const influRef = doc(db, "users", influenceurId);
          const influSnap = await getDoc(influRef);
          if (influSnap.exists()) {
            const influData = influSnap.data();
            setInfluenceur({ id: influSnap.id, ...influData });
          }
        }

        if (dealSnap.exists()) {
          const dealData = dealSnap.data();
          setDeal({ id: dealSnap.id, ...dealData });

          if (influenceurId) {
            const cand = dealData.candidatures?.find((c: any) => c.influenceurId === influenceurId);
            if (cand) {
              setCandidature(cand);
              setHasReviewed(!!cand.influreview);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dealId, influenceurId]);

  const handleApprove = async () => {
    if (!dealId || !influenceurId || !candidature) return;
    setApproving(true);
    try {
      const dealRef = doc(db, "deals", dealId);
      const dealSnap = await getDoc(dealRef);

      if (!dealSnap.exists()) throw new Error("Deal introuvable");
      const dealData = dealSnap.data();

      const updatedCandidatures = dealData.candidatures.map((cand: any) =>
        cand.influenceurId === influenceurId ? { ...cand, status: "Terminé" } : cand
      );

      await updateDoc(dealRef, { candidatures: updatedCandidatures });

      await sendNotification({
        toUserId: influenceurId,
        fromUserId: auth.currentUser?.uid!,
        message: `Votre prestation a été validée par le commerçant.`,
        relatedDealId: dealId,
        dealId: dealId,
        targetRoute: 'DealsDetailsInfluenceur',
        type: "deal_approved",
        receiverId: influenceurId,
      });
      const userSnap = await getDoc(doc(db, "users", influenceurId));
      const userToken = userSnap.exists() ? userSnap.data()?.expoPushToken : null;

      if (userToken) {
        await sendNotificationToToken(userToken,
          "Prestation validée",
          `Votre prestation a été validée par le commerçant.`,
        );
      }

      setCandidature((prev: any) => ({ ...prev, status: "Terminé" }));
    } catch (error) {
      console.error("Erreur lors de l'approbation :", error);
    } finally {
      setApproving(false);
    }
  };

  const handleCancel = async () => {
    if (!dealId || !influenceurId) return;
    setCancelling(true);
    try {
      const dealRef = doc(db, "deals", dealId);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) throw new Error("Deal introuvable");
      const dealData = dealSnap.data();

      const updatedCandidatures = dealData.candidatures.map((cand: any) =>
        cand.influenceurId === influenceurId ? { ...cand, status: "Refusé" } : cand
      );

      await updateDoc(dealRef, { candidatures: updatedCandidatures });

      await sendNotification({
        toUserId: influenceurId,
        fromUserId: auth.currentUser?.uid!,
        message: `Votre candidature a été résiliée par le commerçant.`,
        relatedDealId: dealId,
        targetRoute: 'SuiviDealsCommercant',
        type: "deal_cancelled",
        receiverId: influenceurId,
      });
      const userSnap = await getDoc(doc(db, "users", influenceurId));
      const userToken = userSnap.exists() ? userSnap.data()?.expoPushToken : null;

      if (userToken) {
        await sendNotificationToToken(userToken,
          "Candidature refusée",
          `Votre candidature a été résiliée par le commerçant.`,
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la résiliation :", error);
    } finally {
      setCancelling(false);
    }
  };

  const openGoogleMaps = () => {
    if (deal?.locationCoords) {
      const url = `https://www.google.com/maps?q=${deal.locationCoords.lat},${deal.locationCoords.lng}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/*<Image source={sign} style={styles.loadingImage} />*/}
        <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!deal) {
    return (
      <View style={styles.centered}>
        <Text>Deal introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14210F" />
          </TouchableOpacity>
          <Text style={styles.title}>Détails du Deal {deal.title}</Text>
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

      {/* Deal Image */}
      <Image
        source={deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/profile.png')}
        style={styles.dealImage}
        resizeMode="cover"
      />

      {/* Deal Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{deal.title}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.mapPin}>📍</Text>
          {deal.locationCoords ? (
            <Text style={styles.mapLink} onPress={openGoogleMaps}>
              Voir sur Google Maps
            </Text>
          ) : (
            <Text style={styles.locationName}>{deal.locationName || "Non défini"}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text>{deal.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intérêts</Text>
          <View style={styles.tagContainer}>
            {(deal.interests || []).map((item: string, idx: number) => (
              <View key={idx} style={styles.tag}>
                <Text>{item} </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de contenu</Text>
          <View style={styles.tagContainer}>
            {(deal.typeOfContent || []).map((item: string, idx: number) => (
              <View key={idx} style={styles.tag}>
                <Text>{item} </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Afficher les informations de candidature seulement si une candidature existe */}
        {candidature && (
          <>
            {/* Progress Ribbon */}
            <Text style={styles.title}>Candidature de {influenceur.pseudonyme}</Text>
            <View style={{ marginBottom: 16 }}>
              <ProgressRibbon currentStatus={candidature.status} />
            </View>

            {/* Proofs */}
            {["Accepté", "Approbation", "Terminé"].includes(candidature.status) &&
              candidature.proofs &&
              candidature.proofs.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Captures réalisées :</Text>
                  {candidature.proofs.map((proof: any, index: number) => (
                    <View key={index} style={{ marginBottom: 24 }}>
                      <Image source={{ uri: proof.image }} style={styles.proofImage} />
                      <View style={styles.proofStats}>
                        <Text>Likes : {proof.likes}</Text>
                        <Text>Nombre de partage : {proof.shares}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

            {/* Review */}
            {candidature.status === "Terminé" && candidature.review && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Avis laissé :</Text>
                <Text style={{ fontStyle: "italic" }}>"{candidature.review.comment}"</Text>
              </View>
            )}

            {/* Buttons */}
            {candidature.status === "Terminé" && (
              <TouchableOpacity
                onPress={() =>
                  !hasReviewed && navigation.navigate("ReviewCommercant", { dealId, influenceurId })
                }
                disabled={hasReviewed}
                style={[
                  styles.button,
                  hasReviewed ? styles.disabledButton : styles.primaryButton,
                ]}
              >
                <Text style={styles.buttonText}>
                  {hasReviewed ? "Déjà évalué" : "Noter l'influenceur"}
                </Text>
              </TouchableOpacity>
            )}

            {candidature.status === "Approbation" && (
              <TouchableOpacity
                onPress={handleApprove}
                disabled={approving}
                style={[styles.button, styles.primaryButton, approving && styles.disabledButton]}
              >
                <Text style={styles.buttonText}>{approving ? "Approbation..." : "Approuver"}</Text>
              </TouchableOpacity>
            )}

            {candidature.status === "Envoyé" && (
              <TouchableOpacity
                onPress={handleCancel}
                disabled={cancelling}
                style={[styles.button, styles.cancelButton, cancelling && styles.disabledButton]}
              >
                <Text style={[styles.cancelButtonText]}>
                  {cancelling ? "Résiliation..." : "Résilier"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const ProgressRibbon = ({ currentStatus }: { currentStatus: string }) => {
  const steps = ["Envoyé", "Accepté", "Approbation", "Terminé"];
  const currentStep = {
    Envoyé: 1,
    Accepté: 2,
    Approbation: 3,
    Terminé: 4,
  }[currentStatus] || 1;

  return (
    <View style={progressStyles.container}>
      {steps.map((step, index) => (
        <View key={index} style={progressStyles.stepContainer}>
          <Text style={[progressStyles.stepText, index < currentStep ? progressStyles.activeText : progressStyles.inactiveText]}>
            {step}
          </Text>
          {index < steps.length - 1 && (
            <View style={[progressStyles.connector, index < currentStep - 1 ? progressStyles.activeConnector : progressStyles.inactiveConnector]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f6ed",
    flex: 1,
    paddingTop: 40,
    paddingBottom: 70,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F5E7",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingImage: {
    width: 64,
    height: 64,
  },
  loadingText: {
    marginTop: 16,
    color: "#14210F",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A2C24",
    marginBottom: 8,
  },
  dealImage: {
    width: "100%",
    height: 192,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mapPin: {
    fontSize: 16,
    marginRight: 6,
    color: "#FF6B2E",
  },
  mapLink: {
    color: "#1E90FF",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  locationName: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#1A2C24",
    fontSize: 18,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  proofImage: {
    width: "100%",
    height: 192,
    borderRadius: 8,
  },
  proofStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#FF6B2E",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#1A2C24",
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    color: "#1A2C24",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1A2C24",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  stepText: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  activeText: {
    color: "#FF6B2E",
    fontWeight: "700",
  },
  inactiveText: {
    color: "rgba(255, 107, 46, 0.5)",
  },
  connector: {
    height: 2,
    width: 20,
    marginHorizontal: 2,
  },
  activeConnector: {
    backgroundColor: "#FF6B2E",
  },
  inactiveConnector: {
    backgroundColor: "#999",
  },
});
