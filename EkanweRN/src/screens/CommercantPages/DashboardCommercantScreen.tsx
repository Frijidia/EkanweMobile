import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { db, auth } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Heart, Eye, MoreHorizontal } from "lucide-react-native";
import {Navbar} from "./Navbar";

export const DashboardCommercantScreen = () => {
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

  const toggleSave = (index: number) => {
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, { color: i < rating ? "#FF6B2E" : "#ccc" }]}>★</Text>
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
        <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationsCommercant')}>
              <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
              <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Deals terminés</Text>
          <Text style={styles.statValue}>{stats.totalCompletedDeals}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Note Moyenne</Text>
          <Text style={styles.statValue}>{stats.averageRating} / 5</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Likes</Text>
          <Text style={styles.statValue}>{stats.totalLikes}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Partages</Text>
          <Text style={styles.statValue}>{stats.totalShares}</Text>
        </View>
      </View>

      <ScrollView style={styles.reviewsContainer}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.reviewsTitle}>Avis des influenceurs</Text>
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
              style={styles.reviewCard}
            >
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.avatar || `https://ui-avatars.com/api/?name=${review.username}` }}
                  style={styles.avatar}
                />
                <View style={styles.reviewContent}>
                  <Text style={styles.username}>{review.username}</Text>
                  <View style={styles.starsContainer}>{renderStars(review.rating)}</View>
                  <Text style={styles.comment}>{review.comment}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSave(index)}>
                  <Image
                    source={
                      savedItems[index]
                        ? require("../../assets/fullsave.png")
                        : require("../../assets/save.png")
                    }
                    style={styles.saveIcon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.reviewStats}>
                <View style={styles.statRow}>
                  <Heart size={16} color="#14210F" />
                  <Text style={styles.statText}>{review.likes}</Text>
                </View>
                <View style={styles.statRow}>
                  <Eye size={16} color="#14210F" />
                  <Text style={styles.statText}>{review.shares}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noReviews}>Aucun avis pour l'instant.</Text>
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
    padding: 16
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A2C24'
  },
  notificationIcon: {
    width: 28,
    height: 28
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statCard: {
    backgroundColor: '#1A2C24',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  statLabel: {
    color: 'white',
    fontSize: 14
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  reviewsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  reviewsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2C24'
  },
  reviewCard: {
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  reviewContent: {
    flex: 1
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4
  },
  star: {
    fontSize: 16
  },
  comment: {
    color: 'white',
    fontSize: 14,
    marginTop: 8
  },
  saveIcon: {
    width: 24,
    height: 24
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5E7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    borderRadius: 8
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#14210F'
  },
  noReviews: {
    fontSize: 14,
    color: '#666'
  },
  icon: {
    width: 24,
    height: 24,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  }
});
