import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ThankYouModal = ({ visible, onClose }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View className="flex-1 bg-black/50 justify-center items-center px-4">
      <View className="bg-[#F5F5E7] rounded-2xl p-6 w-full max-w-sm">
        <View className="items-center">
          <View className="h-16 w-16 rounded-full bg-[#FF6B2E]/10 justify-center items-center mb-4">
            <Ionicons name="checkmark" size={40} color="#FF6B2E" />
          </View>
          <Text className="text-2xl font-bold text-[#14210F] mb-2">Merci pour votre évaluation !</Text>
          <Text className="text-gray-600 mb-6 text-center">Votre retour est précieux pour améliorer la qualité des prestations sur Ekanwe.</Text>
          <TouchableOpacity onPress={onClose} className="bg-[#FF6B2E] py-3 px-6 rounded-lg w-full">
            <Text className="text-white text-center font-semibold text-lg">Retour aux prestations</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function ReviewPageCommercant() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dealId, influenceurId } = route.params;
  const [comment, setComment] = useState('');
  const [deal, setDeal] = useState(null);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ratings, setRatings] = useState([
    { category: 'Qualité de la prestation', score: 0 },
    { category: 'Respect des délais', score: 0 },
    { category: 'Communication', score: 0 },
    { category: 'Professionnalisme', score: 0 },
    { category: 'Rapport qualité/prix', score: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!dealId) return;
      const dealRef = doc(db, 'deals', dealId);
      const dealSnap = await getDoc(dealRef);
      if (dealSnap.exists()) setDeal(dealSnap.data());

      const uid = auth.currentUser?.uid;
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUser(userSnap.data());
      }
    };
    fetchData();
  }, [dealId]);

  const handleRatingChange = (index, score) => {
    const updated = [...ratings];
    updated[index].score = score;
    setRatings(updated);
  };

  const handleSubmit = async () => {
    if (!dealId || !user) return;
    const hasRating = ratings.some((r) => r.score > 0);
    if (!hasRating) return Alert.alert('Erreur', 'Veuillez attribuer au moins une étoile.');
    if (!comment.trim()) return Alert.alert('Erreur', 'Veuillez écrire un commentaire.');

    const avgRating = Math.round(ratings.reduce((acc, cur) => acc + cur.score, 0) / ratings.length);

    try {
      const dealRef = doc(db, 'deals', dealId);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) return;
      const dealData = dealSnap.data();
      const uid = auth.currentUser?.uid;

      const updatedCandidatures = dealData.candidatures.map((cand) => {
        if (cand.influenceurId === influenceurId) {
          return {
            ...cand,
            influreview: {
              userId: uid,
              fromUsername: user.pseudonyme || user.prenom || 'Utilisateur',
              avatar: user.photoURL || null,
              rating: avgRating,
              comment: comment.trim(),
            },
          };
        }
        return cand;
      });

      await updateDoc(dealRef, { candidatures: updatedCandidatures });
      setModalVisible(true);
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView className="bg-[#F5F5E7] min-h-screen">
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF6B2E" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Evaluation</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
          <Image source={require('../../assets/ekanwesign.png')} className="w-6 h-6" />
        </TouchableOpacity>
      </View>

      <View className="px-4 mt-4">
        <View className="flex-row items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-200 mr-4" />
          <View>
            <Text className="text-xl font-semibold">{user?.pseudonyme || user?.prenom || 'Nom'}</Text>
            <Text className="text-gray-600 text-sm">Prestation : {(deal?.typeOfContent || []).join(', ')}</Text>
          </View>
        </View>

        {ratings.map((rating, index) => (
          <View key={index} className="mb-4 bg-white/10 p-4 rounded-lg border border-gray-300">
            <Text className="text-lg mb-2 text-[#1A2C24]">{rating.category}</Text>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => handleRatingChange(index, s)}>
                  <Ionicons
                    name="star"
                    size={28}
                    color={s <= rating.score ? '#FF6B2E' : '#D1D5DB'}
                    style={{ marginRight: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text className="text-lg mt-6 mb-2 text-[#1A2C24]">Commentaire</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Partagez votre expérience..."
          className="bg-white/10 border border-gray-300 p-3 rounded-lg text-[#1A2C24]"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          className="mt-6 bg-[#FF6B2E] py-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-lg">Soumettre l'évaluation</Text>
        </TouchableOpacity>
      </View>

      <ThankYouModal visible={modalVisible} onClose={() => {
        setModalVisible(false);
        navigation.navigate('DealsCommercant');
      }} />
    </ScrollView>
  );
}
