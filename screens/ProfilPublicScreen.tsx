import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db, auth } from '../../firebase/firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilPublicInfluenceur() {
  const navigation = useNavigation();
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
      const chatId = [currentUser.uid, userId].sort().join('_');
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
        receiverId: userId,
        pseudonyme: userData.pseudonyme,
        photoURL: userData.photoURL,
        role: userData.role,
      });
    } catch (err) {
      console.error('Erreur contact :', err);
    } finally {
      setLoadingContact(false);
    }
  };

  if (loading || !userData) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F5E7]">
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text className="mt-4 text-[#14210F]">Chargement en cours...</Text>
      </View>
    );
  }

  const { pseudonyme, prenom, nom, bio, email, phone, dateNaissance, interets, photoURL, instagram, tiktok, portfolioLink } = userData;
  const rating = Math.round(averageRatings[userId] || 0);

  return (
    <ScrollView className="bg-[#F5F5E7] min-h-screen px-6 pt-4 pb-20">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4 flex-row items-center">
        <Ionicons name="arrow-back" size={24} color="#FF6B2E" />
        <Text className="ml-2 text-[#FF6B2E] text-lg">Retour</Text>
      </TouchableOpacity>

      <View className="items-center mb-6">
        <Image
          source={{ uri: photoURL || 'https://via.placeholder.com/150' }}
          className="w-28 h-28 rounded-full mb-3"
        />
        <Text className="text-2xl font-semibold text-[#14210F]">{pseudonyme || `${prenom} ${nom}`}</Text>
        <Text className="text-gray-600 text-center mb-2">{bio || 'Aucune bio disponible.'}</Text>
        <View className="flex-row space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Text key={i} className={`text-lg ${i < rating ? 'text-[#FF6B2E]' : 'text-gray-300'}`}>★</Text>
          ))}
        </View>
        <Text className="font-bold text-[#14210F] text-xl mb-4">{dealsApplied} deals réalisés</Text>
        {currentUser?.role === 'commerçant' && currentUser.uid !== userId && (
          <TouchableOpacity
            onPress={handleContact}
            disabled={loadingContact}
            className={`px-6 py-2 rounded-lg ${loadingContact ? 'bg-gray-400' : 'bg-orange-500'}`}
          >
            <Text className="text-white font-medium">{loadingContact ? 'Contact...' : 'Contacter'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="bg-white/10 p-4 rounded-lg mb-6">
        <Text className="text-xl font-semibold text-[#1A2C24] mb-3">Informations personnelles</Text>
        <Text className="text-sm text-[#1A2C24]">Nom : {nom}</Text>
        <Text className="text-sm text-[#1A2C24]">Prénom : {prenom}</Text>
        <Text className="text-sm text-[#1A2C24]">Email : {email}</Text>
        <Text className="text-sm text-[#1A2C24]">Téléphone : {phone}</Text>
        <Text className="text-sm text-[#1A2C24]">Date de naissance : {dateNaissance}</Text>
        {interets?.length > 0 && (
          <Text className="text-sm text-[#1A2C24]">Centres d'intérêt : {interets.join(', ')}</Text>
        )}
      </View>

      {completedDealsData.length > 0 && (
        <View className="mb-6">
          <Text className="text-lg font-bold text-[#14210F] mb-2">Deals terminés :</Text>
          {completedDealsData.map((deal, index) => (
            <View key={index} className="bg-white p-3 rounded-xl shadow mb-2">
              <Text className="font-semibold text-[#14210F]">{deal.title}</Text>
              <Text className="text-sm text-gray-600">{deal.likes} likes · {deal.shares} vues</Text>
            </View>
          ))}
        </View>
      )}

      <View className="mb-6">
        <Text className="text-xl font-semibold text-[#1A2C24] mb-2">Portfolio</Text>
        {portfolioLink && portfolioLink !== 'Nothing' ? (
          <TouchableOpacity onPress={() => Linking.openURL(portfolioLink)} className="bg-white p-3 rounded-lg border text-sm">
            <Text className="text-[#14210F]">Voir le Portfolio</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-gray-500 text-sm">Aucun lien de portfolio</Text>
        )}
      </View>

      <View className="mb-10 space-y-3">
        {instagram && (
          <TouchableOpacity onPress={() => Linking.openURL(instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`)}>
            <Text className="text-orange-500 underline text-sm">Instagram : {instagram}</Text>
          </TouchableOpacity>
        )}
        {tiktok && (
          <TouchableOpacity onPress={() => Linking.openURL(tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok}`)}>
            <Text className="text-orange-500 underline text-sm">TikTok : {tiktok}</Text>
          </TouchableOpacity>
        )}
        {!instagram && !tiktok && <Text className="text-gray-500 text-sm">Aucun réseau social renseigné.</Text>}
      </View>
    </ScrollView>
  );
}
