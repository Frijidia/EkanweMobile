import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReviewScreenRouteProp = RouteProp<RootStackParamList, 'ReviewScreen'>;

interface Rating {
  category: string;
  score: number;
}

const ThankYouModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  if (!isVisible) return null;
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Icon name="check" size={40} color="#FF6B2E" />
          </View>
          <Text style={styles.modalTitle}>Merci pour votre évaluation !</Text>
          <Text style={styles.modalText}>
            Votre retour est précieux pour améliorer la qualité des prestations sur Ekanwe.
          </Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Retour aux prestations</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const StarRating = ({ score, onRate }: { score: number; onRate: (s: number) => void }) => (
  <View style={styles.starContainer}>
    {[1, 2, 3, 4, 5].map((s) => (
      <TouchableOpacity key={s} onPress={() => onRate(s)}>
        <Icon
          name={s <= score ? "star" : "star-outline"}
          size={32}
          color={s <= score ? "#FF6B2E" : "#CCCCCC"}
        />
      </TouchableOpacity>
    ))}
  </View>
);

export const ReviewInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReviewScreenRouteProp>();
  const dealId = route.params.dealId;
  const [comment, setComment] = useState("");
  const [deal, setDeal] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [ratings, setRatings] = useState<Rating[]>([
    { category: "Qualité de la prestation", score: 0 },
    { category: "Respect des délais", score: 0 },
    { category: "Communication", score: 0 },
    { category: "Professionnalisme", score: 0 },
    { category: "Rapport qualité/prix", score: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!dealId) return;

      const dealRef = doc(db, "deals", dealId);
      const dealSnap = await getDoc(dealRef);

      if (dealSnap.exists()) setDeal(dealSnap.data());

      const uid = auth.currentUser?.uid;
      if (uid) {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUser(userSnap.data());
      }
    };

    fetchData();
  }, [dealId]);

  const handleSubmit = async () => {
    if (!dealId || !user) return;
  
    const hasRating = ratings.some(r => r.score > 0);
    if (!hasRating) {
      Alert.alert("Erreur", "Veuillez attribuer au moins une étoile.");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Erreur", "Veuillez écrire un commentaire.");
      return;
    }
  
    const avgRating = Math.round(
      ratings.reduce((acc, cur) => acc + cur.score, 0) / ratings.length
    );
  
    try {
      const dealRef = doc(db, "deals", dealId);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) return;
  
      const dealData = dealSnap.data();
      const uid = auth.currentUser?.uid;
  
      const updatedCandidatures = dealData.candidatures.map((cand: any) => {
        if (cand.influenceurId === uid) {
          return {
            ...cand,
            review: {
              userId: uid,
              fromUsername: user.pseudonyme || user.prenom || "Utilisateur",
              avatar: user.photoURL || null,
              rating: avgRating,
              comment: comment.trim(),
            }
          };
        }
        return cand;
      });
  
      await updateDoc(dealRef, { candidatures: updatedCandidatures });
      setIsModalVisible(true);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'avis :", error);
      Alert.alert("Erreur", "Une erreur est survenue.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    navigation.navigate('DealsInfluenceur');
  };

  const handleRatingChange = (index: number, score: number) => {
    const updated = [...ratings];
    updated[index].score = score;
    setRatings(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color="#FF6B2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Évaluation</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('DealsInfluenceur')}>
          <Image
            source={require('../../assets/ekanwesign.png')}
            style={styles.headerLogo}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.userName}>
              {user?.pseudonyme || user?.prenom || "Nom de l'influenceur"}
            </Text>
            <Text style={styles.dealType}>
              Prestation : {Array.isArray(deal?.typeOfContent) ? deal?.typeOfContent.join(", ") : deal?.typeOfContent}
            </Text>
          </View>
        </View>

        <View style={styles.ratingsContainer}>
          {ratings.map((rating, index) => (
            <View key={index} style={styles.ratingItem}>
              <Text style={styles.ratingCategory}>{rating.category}</Text>
              <StarRating score={rating.score} onRate={(s) => handleRatingChange(index, s)} />
            </View>
          ))}
        </View>

        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Commentaire</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Partagez votre expérience détaillée..."
            placeholderTextColor="#666666"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Soumettre l'évaluation</Text>
        </TouchableOpacity>
      </ScrollView>

      <ThankYouModal isVisible={isModalVisible} onClose={handleCloseModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#CCCCCC',
    borderRadius: 32,
    marginRight: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#14210F',
  },
  dealType: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  ratingsContainer: {
    gap: 16,
  },
  ratingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  ratingCategory: {
    fontSize: 16,
    marginBottom: 8,
    color: '#14210F',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  commentContainer: {
    marginTop: 24,
  },
  commentLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#14210F',
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    color: '#14210F',
    height: 120,
  },
  submitButton: {
    backgroundColor: '#FF6B2E',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
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
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 