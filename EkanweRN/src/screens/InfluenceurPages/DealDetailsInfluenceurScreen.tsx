import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { sendNotification } from '../../hooks/sendNotifications';
import { Linking } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DealDetailsRouteProp = RouteProp<RootStackParamList, 'DealDetailsInfluenceur'>;

const ProgressRibbon = ({ currentStep = 1, status }: { currentStep: number; status: string }) => {
  if (status === "Refusé") {
    return (
      <View style={styles.refusedRibbon}>
        <Text style={styles.refusedText}>Refusé</Text>
      </View>
    );
  }

  const steps = ["Envoyé", "Accepté", "Approbation", "Terminé"];
  return (
    <View style={styles.progressContainer}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepWrapper}>
            <Text style={[
              styles.stepText,
              index < currentStep && styles.activeStepText
            ]}>
              {step}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStep - 1 && styles.activeStepLine
              ]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export const DealDetailsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DealDetailsRouteProp>();
  const [saved, setSaved] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [status, setStatus] = useState("Envoyé");
  const [loading, setLoading] = useState(true);
  const [deal, setDeal] = useState<any>(null);
  const currentStep = 1;

  useEffect(() => {
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
        Alert.alert("Erreur", "Impossible de charger les détails du deal");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [route.params?.dealId]);

  const handleToggleSave = () => {
    setSaved(!saved);
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
      Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi de votre candidature.");
    }
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FF6B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deals</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/profile.png')} 
            style={styles.dealImage} 
            resizeMode="cover" 
          />
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleToggleSave}
          >
            <Icon 
              name={saved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color="#1A2C24" 
            />
          </TouchableOpacity>
        </View>

        <ProgressRibbon currentStep={currentStep} status={status} />

        <View style={styles.detailsContainer}>
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.title}>{deal.title}</Text>
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={16} color="#FF6B2E" />
                <Text style={styles.location}>{deal.locationName}</Text>
                {deal.locationCoords && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://www.google.com/maps?q=${deal.locationCoords.lat},${deal.locationCoords.lng}`)}
                  >
                    <Text style={styles.mapsLink}>Voir sur Google Maps</Text>
                  </TouchableOpacity>
                )}
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
                  <Text key={index} style={styles.interest}>{interest}</Text>
                ))
              ) : (
                <Text style={styles.noInterests}>Aucun intérêt défini</Text>
              )}
            </View>
          </View>

          <View style={styles.infoBox}>
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
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backBtnText}>RETOUR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.applyBtn, alreadyApplied && styles.disabledBtn]}
              onPress={handleCandidature}
              disabled={alreadyApplied}
            >
              <Text style={styles.applyBtnText}>
                {alreadyApplied ? "Candidature envoyée" : "EXÉCUTER"}
              </Text>
            </TouchableOpacity>
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
    backgroundColor: '#f7f6ed',
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    color: '#FF6B2E',
    fontWeight: '500'
  },
  content: {
    flex: 1
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#eee'
  },
  dealImage: {
    width: '100%',
    height: '100%'
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20
  },
  progressContainer: {
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginTop: 8
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepText: {
    color: '#FF6B2E',
    fontSize: 12,
    opacity: 0.7
  },
  activeStepText: {
    fontWeight: 'bold',
    opacity: 1
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#FF6B2E',
    opacity: 0.3,
    marginHorizontal: 4
  },
  activeStepLine: {
    opacity: 1
  },
  refusedRibbon: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 8,
    margin: 16,
    marginTop: 8,
    alignItems: 'center'
  },
  refusedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  location: {
    marginLeft: 4,
    color: '#666'
  },
  dealId: {
    color: '#FF6B2E',
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    fontSize: 12
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8
  },
  description: {
    color: '#666',
    lineHeight: 20
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  interest: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: '#666',
    fontSize: 12
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2C24'
  },
  infoValue: {
    maxWidth: '60%',
    textAlign: 'right',
    color: '#666',
    fontSize: 14
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#1A2C24',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  backBtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#FF6B2E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  applyBtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
  },
  disabledBtn: {
    backgroundColor: '#ccc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingText: {
    marginTop: 10,
    color: '#14210F',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#14210F',
    fontSize: 16,
  },
  mapsLink: {
    color: '#FF6B2E',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
  noInterests: {
    color: '#666',
    fontSize: 14,
  },
});