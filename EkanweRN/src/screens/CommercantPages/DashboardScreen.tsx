import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from "react-native";
import { db, auth } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Heart, Eye, MoreHorizontal } from "lucide-react-native";
import Navbar from "./Navbar";

export default function DashboardPageCommercant() {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [savedItems, setSavedItems] = useState({});
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalShares: 0,
    totalCompletedDeals: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  const toggleSave = (index) => {
    setSavedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const fetchStatsAndReviews = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const dealsSnap = await getDocs(collection(db, "deals"));
      let allReviews = [];
      let likes = 0;
      let shares = 0;
      let ratings = [];
      let completedDeals = 0;

      for (const deal of dealsSnap.docs) {
        const dealData = deal.data();
        if (dealData.merchantId !== currentUser.uid) continue;

        const candidatures = dealData.candidatures || [];
        for (const c of candidatures) {
          if (c.status === "Terminé") completedDeals++;
          if (c.proofs && Array.isArray(c.proofs)) {
            c.proofs.forEach((proof) => {
              likes += proof.likes || 0;
              shares += proof.shares || 0;
            });
          }

          if (c.review) {
            allReviews.push({
              userId: c.review.userId,
              username: c.review.fromUsername,
              avatar: c.review.avatar || null,
              rating: c.review.rating || 0,
              comment: c.review.comment || "",
              likes:
                c.proofs?.reduce((acc, p) => acc + (p.likes || 0), 0) || 0,
              shares:
                c.proofs?.reduce((acc, p) => acc + (p.shares || 0), 0) || 0,
              dealId: deal.id,
              influenceurId: c.influenceurId,
            });

            ratings.push(c.review.rating);
          }
        }
      }

      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      setReviews(allReviews);
      setStats({
        totalLikes: likes,
        totalShares: shares,
        totalCompletedDeals: completedDeals,
        averageRating: parseFloat(avgRating.toFixed(1)),
      });
      setLoading(false);
    };

    fetchStatsAndReviews();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={{ color: i < rating ? "#FF6B2E" : "#ccc" }}>★</Text>
    ));
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
        <Text className="text-3xl font-bold text-[#1A2C24]">Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}> {/* Replace with real route */}
          <Image source={require("../../assets/clochenotification.png")} className="w-7 h-7" />
        </TouchableOpacity>
      </View>

      <View className="px-4 mb-4 flex-row flex-wrap justify-between">
        <View className="bg-[#1A2C24] w-[48%] p-4 rounded-lg mb-3">
          <Text className="text-white text-sm">Deals terminés</Text>
          <Text className="text-white text-2xl font-bold">{stats.totalCompletedDeals}</Text>
        </View>
        <View className="bg-[#1A2C24] w-[48%] p-4 rounded-lg mb-3">
          <Text className="text-white text-sm">Note Moyenne</Text>
          <Text className="text-white text-2xl font-bold">{stats.averageRating} / 5</Text>
        </View>
        <View className="bg-[#1A2C24] w-[48%] p-4 rounded-lg mb-3">
          <Text className="text-white text-sm">Total Likes</Text>
          <Text className="text-white text-2xl font-bold">{stats.totalLikes}</Text>
        </View>
        <View className="bg-[#1A2C24] w-[48%] p-4 rounded-lg mb-3">
          <Text className="text-white text-sm">Total Partages</Text>
          <Text className="text-white text-2xl font-bold">{stats.totalShares}</Text>
        </View>
      </View>

      <ScrollView className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-[#1A2C24]">Avis des influenceurs</Text>
          <MoreHorizontal size={20} color="#1A2C24" />
        </View>

        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate("DealDetailCommercant", {
                dealId: review.dealId,
                influenceurId: review.influenceurId,
              })}
              className="bg-[#1A2C24] rounded-lg p-4 mb-4"
            >
              <View className="flex-row items-start">
                <Image
                  source={{ uri: review.avatar || `https://ui-avatars.com/api/?name=${review.username}` }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">{review.username}</Text>
                  <View className="flex-row mt-1">{renderStars(review.rating)}</View>
                  <Text className="text-white text-sm mt-2">{review.comment}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSave(index)}>
                  <Image
                    source={
                      savedItems[index]
                        ? require("../../assets/fullsave.png")
                        : require("../../assets/save.png")
                    }
                    className="w-6 h-6"
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between bg-[#F5F5E7] text-[#14210F] px-3 py-2 mt-4 rounded-lg">
                <View className="flex-row items-center">
                  <Heart size={16} color="#14210F" />
                  <Text className="ml-1 text-xs font-medium">{review.likes}</Text>
                </View>
                <View className="flex-row items-center">
                  <Eye size={16} color="#14210F" />
                  <Text className="ml-1 text-xs font-medium">{review.shares}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-sm text-gray-700">Aucun avis pour l'instant.</Text>
        )}
      </ScrollView>

      <Navbar />
    </View>
  );
}
