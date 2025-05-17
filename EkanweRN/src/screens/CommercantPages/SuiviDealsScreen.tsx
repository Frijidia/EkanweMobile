import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, doc, getDoc, onSnapshot, updateDoc, where, query } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { MessageCircle } from "lucide-react-native";
import Navbar from "../../components/Navbar";

const filters = ["Tous", "Envoyé", "Accepté", "Approbation", "Terminé", "Refusé"];

export default function SuivisDealsPageCommercant() {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("Tous");
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIndex, setLoadingIndex] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "deals"), where("merchantId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach((docSnap) => {
        const deal = docSnap.data();
        const dealId = docSnap.id;
        (deal.candidatures || []).forEach((cand, idx) => {
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

  const handleStatusChange = async (dealId, index, newStatus) => {
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

  const getLabel = (status) => {
    switch (status) {
      case "Approbation": return "En attente de validation";
      case "Terminé": return "Mission terminée";
      case "Accepté": return "En cours ...";
      default: return status;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F5E7]">
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text className="mt-4 text-[#14210F]">Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F5E7]">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-2xl font-bold">Suivi Candidatures</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {filters.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setSelectedFilter(item)}
            className={`px-5 py-2 mr-2 rounded-full ${selectedFilter === item ? "bg-[#1A2C24]" : "bg-white/20"}`}
          >
            <Text className={`${selectedFilter === item ? "text-white" : "text-[#1A2C24]"}`}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="px-4 mt-4">
        {filtered.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">Aucune candidature trouvée</Text>
        ) : (
          filtered.map((c, index) => (
            <View key={index} className="flex-row bg-white/20 rounded-lg p-3 mb-4 items-start">
              <Image source={{ uri: c.dealInfo?.imageUrl }} className="w-20 h-20 rounded-lg mr-3" />
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#1A2C24]">{c.dealInfo?.title}</Text>
                <Text className="text-xs text-gray-600" numberOfLines={1}>{c.dealInfo?.description}</Text>
                <View className="flex-row justify-between mt-2 items-center">
                  <View className="flex-row space-x-2">
                    {c.status === "Envoyé" ? (
                      <>
                        <TouchableOpacity
                          className="bg-[#1A2C24] px-2 py-1 rounded"
                          onPress={() => handleStatusChange(c.dealId, c.candidatureIndex, "Accepté")}
                          disabled={loadingIndex === c.candidatureIndex}
                        >
                          <Text className="text-white text-xs">{loadingIndex === c.candidatureIndex ? "..." : "Accepter"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-red-500 px-2 py-1 rounded"
                          onPress={() => handleStatusChange(c.dealId, c.candidatureIndex, "Refusé")}
                          disabled={loadingIndex === c.candidatureIndex}
                        >
                          <Text className="text-white text-xs">{loadingIndex === c.candidatureIndex ? "..." : "Refuser"}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text className="bg-[#FF6B2E] text-white text-xs px-3 py-1 rounded-full">{getLabel(c.status)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("DealDetailCommercant", { dealId: c.dealId, influenceurId: c.influenceurId })}
                  >
                    <ArrowRight size={20} color="#14210F" />
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
