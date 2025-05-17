import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
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
      <View className="flex-1 items-center justify-center bg-[#F5F5E7]">
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text className="mt-4 text-[#14210F]">Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF6B2E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("DealsCommercant")}>
          <Image source={sign} className="w-6 h-6" />
        </TouchableOpacity>
      </View>

      {deal && (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Image
            source={{ uri: deal.imageUrl || Image.resolveAssetSource(profile).uri }}
            style={{ width: "100%", height: 200 }}
            resizeMode="cover"
          />

          <View className="p-4">
            <Text className="text-2xl font-bold mb-1">{deal.title}</Text>
            <Text className="text-[#FF6B2E] mb-3">{deal.location || "Non défini"}</Text>
            <Text className="text-base text-[#1A2C24] mb-6">{deal.description}</Text>

            <Text className="text-xl font-bold text-[#1A2C24] mb-3">Candidats</Text>
            {candidates.length === 0 ? (
              <Text className="text-gray-500">Aucun candidat pour ce deal.</Text>
            ) : (
              candidates.map((cand) => (
                <TouchableOpacity
                  key={cand.influenceurId}
                  onPress={() => navigation.navigate("ProfilPublicCommercant", { userId: cand.influenceurId })}
                  className="bg-gray-100 p-4 mb-3 rounded-xl"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: cand.userInfo?.photoURL || Image.resolveAssetSource(profile).uri }}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <View>
                        <Text className="font-semibold text-[#1A2C24] mb-1">{cand.userInfo?.pseudonyme}</Text>
                        <View className="flex-row">{renderStars(Math.round(averageRatings[cand.influenceurId] || 0))}</View>
                      </View>
                    </View>
                    <View className="items-end">
                      {cand.status === "Envoyé" && (
                        <>
                          <TouchableOpacity
                            className="bg-[#1A2C24] px-4 py-1 mb-1 rounded"
                            onPress={() => updateStatus(cand.influenceurId, "Accepté")}
                            disabled={buttonLoading === cand.influenceurId + "Accepté"}
                          >
                            <Text className="text-white text-xs">{buttonLoading === cand.influenceurId + "Accepté" ? "..." : "ACCEPTER"}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="border border-[#1A2C24] px-4 py-1 rounded"
                            onPress={() => updateStatus(cand.influenceurId, "Refusé")}
                            disabled={buttonLoading === cand.influenceurId + "Refusé"}
                          >
                            <Text className="text-[#1A2C24] text-xs">{buttonLoading === cand.influenceurId + "Refusé" ? "..." : "REFUSER"}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {cand.status === "Accepté" && (
                        <>
                          <Text className="text-sm bg-gray-300 px-3 py-1 rounded mb-1">EN COURS</Text>
                          <TouchableOpacity
                            onPress={() => cancelContract(cand.influenceurId)}
                            disabled={buttonLoading === cand.influenceurId + "cancel"}
                          >
                            <Text className="text-red-500 text-xs underline">{buttonLoading === cand.influenceurId + "cancel" ? "..." : "RÉSILIER"}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {cand.status === "Refusé" && (
                        <Text className="text-red-500 font-bold text-xs">REFUSÉ</Text>
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
