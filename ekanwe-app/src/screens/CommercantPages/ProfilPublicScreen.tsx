import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db, auth } from '../../firebase/firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfilPublicScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { userId } = route.params;

  const [userData, setUserData] = useState(null);
  const [dealsApplied, setDealsApplied] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [completedDealsData, setCompletedDealsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingContact, setLoadingContact] = useState(false);
  const [averageRatings, setAverageRatings] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authUser = auth.currentUser;
        if (!authUser || !userId) return;

        const currentSnap = await getDoc(doc(db, 'users', authUser.uid));
        if (currentSnap.exists()) setCurrentUser({ uid: authUser.uid, ...currentSnap.data() });

        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) setUserData(userSnap.data());

        const snapshot = await getDocs(collection(db, 'deals'));
        let count = 0;
        let completed = [];
        let ratings = {};

        snapshot.forEach(docSnap => {
          const deal = docSnap.data();
          (deal.candidatures || []).forEach(c => {
            if (c.influenceurId === userId && c.status === 'Terminé') {
              count++;
              let likes = 0;
              let shares = 0;
              (c.proofs || []).forEach(p => {
                likes += p.likes || 0;
                shares += p.shares || 0;
              });
              completed.push({ title: deal.title, likes, shares });
            }
            if (c.influreview && c.influenceurId === userId) {
              if (!ratings[userId]) ratings[userId] = { total: 0, count: 0 };
              ratings[userId].total += c.influreview.rating;
              ratings[userId].count += 1;
            }
          });
        });

        setDealsApplied(count);
        setCompletedDealsData(completed);

        const avg = {};
        for (let uid in ratings) {
          avg[uid] = ratings[uid].total / ratings[uid].count;
        }
        setAverageRatings(avg);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleContact = async () => {
    if (!currentUser || !userId || currentUser.uid === userId) return;
    setLoadingContact(true);
    try {
      const chatId = [userId, currentUser.uid].sort().join("");
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        const welcome = {
          senderId: currentUser.uid,
          text: 'Bonjour, je suis intéressé par votre profil. Discutons ensemble.',
          createdAt: new Date()
        };
        await setDoc(chatRef, { messages: [welcome] });
      }

      const userChatsRef = doc(db, 'userchats', currentUser.uid);
      const merchantChat = {
        chatId,
        receiverId: userId,
        lastMessage: 'Bonjour, je suis intéressé par votre profil.',
        updatedAt: Date.now(),
        read: true
      };
      const currentSnap = await getDoc(userChatsRef);
      if (currentSnap.exists()) {
        const chats = currentSnap.data().chats || [];
        if (!chats.find(c => c.chatId === chatId)) {
          chats.push(merchantChat);
          await updateDoc(userChatsRef, { chats });
        }
      } else {
        await setDoc(userChatsRef, { chats: [merchantChat] });
      }

      const inflChatsRef = doc(db, 'userchats', userId);
      const inflChat = {
        chatId,
        receiverId: currentUser.uid,
        lastMessage: 'Bonjour, je suis intéressé par votre profil.',
        updatedAt: Date.now(),
        read: false
      };
      const inflSnap = await getDoc(inflChatsRef);
      if (inflSnap.exists()) {
        const chats = inflSnap.data().chats || [];
        if (!chats.find(c => c.chatId === chatId)) {
          chats.push(inflChat);
          await updateDoc(inflChatsRef, { chats });
        }
      } else {
        await setDoc(inflChatsRef, { chats: [inflChat] });
      }

      navigation.navigate('Chat', {
        chatId,
        pseudonyme: userData.pseudonyme,
        photoURL: userData.photoURL,
      });
    } catch (err) {
      console.error('Erreur contact :', err);
    } finally {
      setLoadingContact(false);
    }
  };

  if (loading || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  const { pseudonyme, prenom, nom, bio, email, phone, dateNaissance, interets, photoURL, instagram, tiktok, portfolioLink } = userData;
  const rating = Math.round(averageRatings[userId] || 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14210F" />
          </TouchableOpacity>
          <Text style={styles.title}>Profil Public</Text>
        </View>
      </View>

      <View style={styles.profileHeader}>
        <Image
          source={{ uri: photoURL || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{pseudonyme || `${prenom} ${nom}`}</Text>
        <Text style={styles.profileBio}>{bio || 'Aucune bio disponible.'}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={[styles.star, i < rating && styles.starFilled]}>★</Text>
          ))}
        </View>
        <Text style={styles.dealsCount}>{dealsApplied} deals réalisés</Text>
        {currentUser?.role === 'commerçant' && currentUser.uid !== userId && (
          <TouchableOpacity
            onPress={handleContact}
            disabled={loadingContact}
            style={[styles.contactButton, loadingContact && styles.contactButtonDisabled]}
          >
            <Text style={styles.contactButtonText}>{loadingContact ? 'Contact...' : 'Contacter'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <Text style={styles.infoText}>Nom : {nom}</Text>
        <Text style={styles.infoText}>Prénom : {prenom}</Text>
        <Text style={styles.infoText}>Email : {email}</Text>
        <Text style={styles.infoText}>Téléphone : {phone}</Text>
        <Text style={styles.infoText}>Date de naissance : {dateNaissance}</Text>
        {interets?.length > 0 && (
          <Text style={styles.infoText}>Centres d'intérêt : {interets.join(', ')}</Text>
        )}
      </View>

      {completedDealsData.length > 0 && (
        <View style={styles.dealsSection}>
          <Text style={styles.sectionTitle}>Deals terminés :</Text>
          {completedDealsData.map((deal, index) => (
            <View key={index} style={styles.dealCard}>
              <Text style={styles.dealTitle}>{deal.title}</Text>
              <Text style={styles.dealStats}>{deal.likes} likes · {deal.shares} nombre de partage</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.portfolioSection}>
        <Text style={styles.sectionTitle}>Portfolio</Text>
        {portfolioLink && portfolioLink !== 'Nothing' ? (
          <TouchableOpacity onPress={() => Linking.openURL(portfolioLink)} style={styles.portfolioButton}>
            <Text style={styles.portfolioButtonText}>Voir le Portfolio</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noContentText}>Aucun lien de portfolio</Text>
        )}
      </View>

      <View style={styles.socialSection}>
        {instagram && (
          <TouchableOpacity onPress={() => Linking.openURL(instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`)}>
            <Text style={styles.socialLink}>Instagram : {instagram}</Text>
          </TouchableOpacity>
        )}
        {tiktok && (
          <TouchableOpacity onPress={() => Linking.openURL(tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok}`)}>
            <Text style={styles.socialLink}>TikTok : {tiktok}</Text>
          </TouchableOpacity>
        )}
        {!instagram && !tiktok && <Text style={styles.noContentText}>Aucun réseau social renseigné.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    padding: 24,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingText: {
    marginTop: 16,
    color: '#14210F',
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#14210F',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#14210F',
  },
  profileBio: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 18,
    color: '#gray-300',
  },
  starFilled: {
    color: '#FF6B2E',
  },
  dealsCount: {
    fontWeight: '700',
    color: '#14210F',
    fontSize: 20,
    marginBottom: 16,
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF6B2E',
  },
  contactButtonDisabled: {
    backgroundColor: '#gray-400',
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2C24',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1A2C24',
  },
  dealsSection: {
    marginBottom: 24,
  },
  dealCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 8,
  },
  dealTitle: {
    fontWeight: '600',
    color: '#14210F',
  },
  dealStats: {
    fontSize: 14,
    color: '#666',
  },
  portfolioSection: {
    marginBottom: 24,
  },
  portfolioButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  portfolioButtonText: {
    fontSize: 14,
    color: '#14210F',
  },
  socialSection: {
    marginBottom: 40,
  },
  socialLink: {
    color: '#FF6B2E',
    textDecorationLine: 'underline',
    fontSize: 14,
    marginBottom: 12,
  },
  noContentText: {
    color: '#666',
    fontSize: 14,
  },
});
