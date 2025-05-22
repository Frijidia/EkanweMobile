import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { sendNotification } from '../../hooks/sendNotifications';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DealsSeeMoreRouteProp = RouteProp<RootStackParamList, 'DealsSeeMoreInfluenceur'>;

export const DealsSeeMoreInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DealsSeeMoreRouteProp>();
  const [deal, setDeal] = useState<any>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchDeal();
  }, [route.params?.dealId]);

  const fetchDeal = async () => {
    if (!route.params?.dealId) return;

    try {
      const dealRef = doc(db, "deals", route.params.dealId);
      const dealSnap = await getDoc(dealRef);

      if (dealSnap.exists()) {
        const data = dealSnap.data();
        setDeal({ id: dealSnap.id, ...data });

        const userId = auth.currentUser?.uid;
        if (userId && data.candidatures) {
          const applied = data.candidatures.some((c: any) => c.influenceurId === userId);
          setAlreadyApplied(applied);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du deal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidature = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Connexion requise", "Veuillez vous connecter pour postuler.");
      return;
    }

    try {
      const dealRef = doc(db, "deals", deal.id);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) {
        Alert.alert("Erreur", "Deal introuvable.");
        return;
      }

      const dealData = dealSnap.data();
      const candidatures = dealData?.candidatures || [];

      if (candidatures.some((cand: any) => cand.influenceurId === user.uid)) {
        setAlreadyApplied(true);
        Alert.alert("Déjà postulé", "Vous avez déjà postulé à ce deal.");
        return;
      }

      const newCandidature = {
        influenceurId: user.uid,
        status: "Envoyé",
      };

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
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      const firstMessage = {
        senderId: user.uid,
        text: `Hello, je suis intéressé par le deal "${deal.title}". Pouvez-vous m'en dire plus ?`,
        createdAt: new Date(),
      };

      if (!chatSnap.exists()) {
        await setDoc(chatRef, { messages: [firstMessage] });
      } else {
        await updateDoc(chatRef, { messages: arrayUnion(firstMessage) });
      }

      const updateUserChats = async (uid: string, receiverId: string, read: boolean) => {
        const ref = doc(db, "userchats", uid);
        const snap = await getDoc(ref);
        const entry = {
          chatId,
          lastMessage: firstMessage.text,
          receiverId,
          updatedAt: Date.now(),
          read,
        };

        if (snap.exists()) {
          const data = snap.data();
          const chats = data.chats || [];
          const idx = chats.findIndex((c: any) => c.chatId === chatId);
          if (idx !== -1) chats[idx] = entry;
          else chats.push(entry);
          await updateDoc(ref, { chats });
        } else {
          await setDoc(ref, { chats: [entry] });
        }
      };

      await updateUserChats(user.uid, deal.merchantId, true);
      await updateUserChats(deal.merchantId, user.uid, false);

      setAlreadyApplied(true);
      Alert.alert("Succès", "Votre candidature a été envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la candidature :", error);
      Alert.alert("Erreur", "Une erreur est survenue.");
    }
  };

  const handleToggleSave = () => {
    setSaved(!saved);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!deal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Deal introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FF6B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deals</Text>
      </View>

        <View style={styles.dealCard}>
          <View style={styles.imageContainer}>
            <Image
              source={deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/profile.png')}
              style={styles.dealImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleToggleSave}>
              <Image
                source={saved ? require('../../assets/fullsave.png') : require('../../assets/save.png')}
                style={styles.saveIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dealContent}>
            <View style={styles.titleContainer}>
              <View>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                <View style={styles.locationContainer}>
                  <Icon name="map-marker" size={16} color="#FF6B2E" />
                  <View>
                    {deal.locationName && (
                      <Text style={styles.locationName}>{deal.locationName}</Text>
                    )}
                    {deal.locationCoords && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`https://www.google.com/maps?q=${deal.locationCoords.lat},${deal.locationCoords.lng}`)}
                      >
                        <Text style={styles.locationLink}>Voir sur Google Maps</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
              <Text style={styles.dealId}>#{deal.id}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{deal.description}</Text>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intérêts</Text>
            <View style={styles.interestsContainer}>
                {deal.interests && deal.interests.length > 0 ? (
                  deal.interests.map((interest: string, index: number) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
                  ))
                ) : (
                  <Text style={styles.noInterestText}>Aucun intérêt défini</Text>
                )}
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type de Contenu</Text>
                <Text style={styles.infoValue}>{deal.typeOfContent || "Non spécifié"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date de Validité</Text>
                <Text style={styles.infoValue}>{deal.validUntil || "Non spécifiée"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Conditions</Text>
                <Text style={styles.infoValue}>{deal.conditions || "Aucune condition"}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.navigate('DealsInfluenceur')}
              >
                <Text style={styles.backButtonText}>RETOUR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, alreadyApplied && styles.disabledButton]}
                onPress={handleCandidature}
                disabled={alreadyApplied}
              >
                <Text style={styles.applyButtonText}>
                  {alreadyApplied ? "Candidature envoyée" : "EXÉCUTER"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  errorText: {
    color: '#14210F',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B2E',
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(26, 44, 36, 0.9)',
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dealTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8,
  },
  dealId: {
    color: '#FF6B2E',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationName: {
    color: '#1A2C24',
    fontSize: 14,
    fontWeight: '500',
  },
  locationLink: {
    color: '#FF6B2E',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#1A2C24',
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#F5F5E7',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestText: {
    color: '#1A2C24',
    fontSize: 14,
  },
  noInterestText: {
    color: '#666666',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#F5F5E7',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  infoValue: {
    fontSize: 14,
    color: '#1A2C24',
    maxWidth: '60%',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#1A2C24',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});