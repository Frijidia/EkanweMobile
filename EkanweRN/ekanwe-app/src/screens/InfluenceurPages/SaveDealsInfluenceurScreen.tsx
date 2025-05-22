import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavbar } from './BottomNavbar';
import { RootStackParamList } from '../../types/navigation';
import { sendNotification } from '../../hooks/sendNotifications';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SaveDealsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [savedDeals, setSavedDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) return;

    const saveRef = doc(db, "saveDeal", user.uid);
    const unsubscribe = onSnapshot(saveRef, async (snap) => {
      const data = snap.data();
      const dealIds: string[] = data?.deals || [];
      const dealsFetched = await Promise.all(
        dealIds.map(async (id) => {
          const dealSnap = await getDoc(doc(db, "deals", id));
          if (dealSnap.exists()) return { id, ...dealSnap.data() };
          return null;
        })
      );
      setSavedDeals(dealsFetched.filter(Boolean));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleToggleSave = async (dealId: string) => {
    if (!user?.uid) return;
    const saveRef = doc(db, "saveDeal", user.uid);
    const snap = await getDoc(saveRef);
    const current = snap.exists() ? snap.data().deals || [] : [];
    const updated = current.includes(dealId)
      ? current.filter((id: string) => id !== dealId)
      : [...current, dealId];

    await setDoc(saveRef, { deals: updated });
  };

  const getStatus = (deal: any) => {
    const uid = auth.currentUser?.uid;
    return deal.candidatures?.find((c: any) => c.influenceurId === uid)?.status;
  };

  const handleApplyToDeal = async (deal: any) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erreur", "Veuillez vous connecter pour postuler.");
      return;
    }
    setLoading(true);

    try {
      const dealRef = doc(db, "deals", deal.id);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) throw new Error("Deal introuvable.");

      const dealData = dealSnap.data();
      const candidatures = dealData?.candidatures || [];
      if (candidatures.some((cand: any) => cand.influenceurId === user.uid)) {
        Alert.alert("Erreur", "Vous avez déjà postulé à ce deal.");
        setLoading(false);
        return;
      }

      const newCandidature = { influenceurId: user.uid, status: "Envoyé" };
      await updateDoc(dealRef, { candidatures: arrayUnion(newCandidature) });

      await sendNotification({
        toUserId: deal.merchantId,
        fromUserId: user.uid,
        message: "Un influenceur a postulé à votre deal !",
        type: "application",
        relatedDealId: deal.id,
        targetRoute: `/dealcandidatescommercant/${deal.id}`,
      });

      const chatId = [user.uid, deal.merchantId].sort().join("");
      const message = {
        senderId: user.uid,
        text: `Bonjour, je suis intéressé par le deal "${deal.title}".`,
        createdAt: new Date(),
      };

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, { messages: [message] });
      } else {
        await updateDoc(chatRef, { messages: arrayUnion(message) });
      }

      const updateUserChats = async (uid: string, receiverId: string, read: boolean) => {
        const ref = doc(db, "userchats", uid);
        const snap = await getDoc(ref);
        const newChat = { chatId, receiverId, lastMessage: message.text, updatedAt: Date.now(), read };
        if (snap.exists()) {
          const data = snap.data();
          const chats = data.chats || [];
          const idx = chats.findIndex((c: any) => c.chatId === chatId);
          if (idx !== -1) chats[idx] = newChat;
          else chats.push(newChat);
          await updateDoc(ref, { chats });
        } else {
          await setDoc(ref, { chats: [newChat] });
        }
      };

      await updateUserChats(user.uid, deal.merchantId, true);
      await updateUserChats(deal.merchantId, user.uid, false);
      Alert.alert("Succès", "Votre candidature a été envoyée !");
    } catch (err) {
      console.error("Erreur lors de la candidature :", err);
      Alert.alert("Erreur", "Une erreur est survenue lors de la candidature.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusButton = (status: string, deal: any) => {
    const getButtonStyle = () => {
      switch (status) {
        case "Envoyé": return styles.statusButtonGray;
        case "Accepté": return styles.statusButtonBlue;
        case "Approbation": return styles.statusButtonYellow;
        case "Terminé": return styles.statusButtonGreen;
        default: return styles.statusButtonOrange;
      }
    };

    const getButtonText = () => {
      switch (status) {
        case "Envoyé": return "Candidature envoyée";
        case "Accepté": return "Accepté";
        case "Approbation": return "En attente validation";
        case "Terminé": return "Mission terminée";
        default: return "Dealer";
      }
    };

    return (
      <TouchableOpacity
        style={[styles.statusButton, getButtonStyle()]}
        onPress={() => !status && handleApplyToDeal(deal)}
        disabled={!!status}
      >
        <Text style={styles.statusButtonText}>{getButtonText()}</Text>
      </TouchableOpacity>
    );
  };

  const filteredDeals = savedDeals.filter(deal =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enregistrés</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationInfluenceur')}>
            <Image source={require('../../assets/clochenotification.png')} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('DealsInfluenceur')}>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={require('../../assets/loupe.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Recherche"
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={require('../../assets/menu.png')} style={styles.menuIcon} />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B2E" />
          <Text style={styles.loadingText}>Chargement en cours...</Text>
        </View>
      ) : filteredDeals.length === 0 ? (
        <Text style={styles.emptyText}>Aucun deal enregistré.</Text>
      ) : (
        <ScrollView style={styles.dealsList}>
          {filteredDeals.map((deal: any, index: number) => {
            const status = getStatus(deal);
            return (
              <View key={index} style={styles.dealCard}>
                <View style={styles.imageContainer}>
                  <Image
                    source={deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/profile.png')}
                    style={styles.dealImage}
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => handleToggleSave(deal.id)}
                  >
                    <Image source={require('../../assets/fullsave.png')} style={styles.saveIcon} />
                  </TouchableOpacity>
                </View>
                <View style={styles.dealContent}>
                  <Text style={styles.dealTitle}>{deal.title}</Text>
                  <Text style={styles.dealDescription} numberOfLines={2}>{deal.description}</Text>
                  <View style={styles.dealActions}>
                    <TouchableOpacity
                      style={styles.viewMoreButton}
                      onPress={() => navigation.navigate('DealsSeeMoreInfluenceur', { dealId: deal.id })}
                    >
                      <Text style={styles.viewMoreText}>Voir plus</Text>
                    </TouchableOpacity>
                    {renderStatusButton(status, deal)}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <BottomNavbar />
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
    backgroundColor: '#F5F5E7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 12,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#14210F',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#14210F',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 40,
    fontSize: 16,
  },
  dealsList: {
    padding: 16,
  },
  dealCard: {
    backgroundColor: '#1A2C24',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 16/9,
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  saveIcon: {
    width: 20,
    height: 20,
  },
  dealContent: {
    padding: 16,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dealDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  dealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  viewMoreButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtonGray: {
    backgroundColor: '#666666',
  },
  statusButtonBlue: {
    backgroundColor: '#3B82F6',
  },
  statusButtonYellow: {
    backgroundColor: '#EAB308',
  },
  statusButtonGreen: {
    backgroundColor: '#15803D',
  },
  statusButtonOrange: {
    backgroundColor: '#FF6B2E',
  },
});