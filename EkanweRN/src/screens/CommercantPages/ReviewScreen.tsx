import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ThankYouModal = ({ visible, onClose }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalInner}>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark" size={40} color="#FF6B2E" />
          </View>
          <Text style={styles.modalTitle}>Merci pour votre évaluation !</Text>
          <Text style={styles.modalText}>Votre retour est précieux pour améliorer la qualité des prestations sur Ekanwe.</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Retour aux prestations</Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF6B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluation</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
          <Image source={require('../../assets/ekanwesign.png')} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.username}>{user?.pseudonyme || user?.prenom || 'Nom'}</Text>
            <Text style={styles.prestationType}>Prestation : {(deal?.typeOfContent || []).join(', ')}</Text>
          </View>
        </View>

        {ratings.map((rating, index) => (
          <View key={index} style={styles.ratingCard}>
            <Text style={styles.ratingCategory}>{rating.category}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => handleRatingChange(index, s)}>
                  <Ionicons
                    name="star"
                    size={28}
                    color={s <= rating.score ? '#FF6B2E' : '#D1D5DB'}
                    style={styles.star}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.commentLabel}>Commentaire</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Partagez votre expérience..."
          style={styles.commentInput}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Soumettre l'évaluation</Text>
        </TouchableOpacity>
      </View>

      <ThankYouModal visible={modalVisible} onClose={() => {
        setModalVisible(false);
        navigation.navigate('DealsCommercant');
      }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logo: {
    width: 24,
    height: 24,
  },
  content: {
    padding: 16,
    marginTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1D5DB',
    marginRight: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
  },
  prestationType: {
    fontSize: 14,
    color: '#666',
  },
  ratingCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  ratingCategory: {
    fontSize: 18,
    marginBottom: 8,
    color: '#1A2C24',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 4,
  },
  commentLabel: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 8,
    color: '#1A2C24',
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    color: '#1A2C24',
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#FF6B2E',
    padding: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#F5F5E7',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  modalInner: {
    alignItems: 'center',
  },
  checkmarkContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
    marginBottom: 8,
  },
  modalText: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FF6B2E',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
