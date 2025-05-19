import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection, getDocs } from 'firebase/firestore';
import { sendNotification } from '../../hooks/sendNotifications';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DealDetailsRouteProp = RouteProp<RootStackParamList, 'DealDetailsInfluenceur'>;

interface Upload {
  image: string;
  likes: number;
  shares: number;
  isValidated: boolean;
  loading?: boolean;
}

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
  const [timeline, setTimeline] = useState<any[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [candidature, setCandidature] = useState<any>(null);

  useEffect(() => {
    fetchDeal();
  }, [route.params?.dealId]);

  const fetchDeal = async () => {
    if (!route.params?.dealId) return;

    try {
      const dealRef = doc(db, "deals", route.params.dealId);
      const dealSnap = await getDoc(dealRef);

      if (dealSnap.exists()) {
        const dealData = dealSnap.data();
        setDeal({ id: dealSnap.id, ...dealData });

        const currentUserId = auth.currentUser?.uid;
        if (currentUserId && dealData?.candidatures) {
          const candidature = dealData.candidatures.find((c: any) => c.influenceurId === currentUserId);
          if (candidature) {
            setStatus(candidature.status);
            setCandidature(candidature || null);
            setHasReviewed(!!candidature.review);
            setUploads(candidature.proofs || []);
          }
        }
      }

      const eventsSnap = await getDocs(collection(db, "deals", route.params.dealId, "events"));
      setTimeline(eventsSnap.docs.map((doc) => doc.data()));
    } catch (error) {
      console.error("Erreur lors du fetch:", error);
      Alert.alert("Erreur", "Impossible de charger les détails du deal");
    } finally {
      setLoading(false);
    }
  };

  const syncProofsToFirestore = async (newProofs: Upload[]) => {
    const userId = auth.currentUser?.uid;
    if (!deal || !userId) return;

    const dealRef = doc(db, "deals", deal.id);
    const dealSnap = await getDoc(dealRef);
    if (!dealSnap.exists()) return;

    const data = dealSnap.data();
    const updated = data.candidatures.map((c: any) =>
      c.influenceurId === userId ? { ...c, proofs: newProofs } : c
    );

    await updateDoc(dealRef, { candidatures: updated });
  };

  const handleValidateUpload = async (index: number) => {
    const newUploads = [...uploads];
    newUploads[index].loading = true;
    setUploads(prev => {
      const newUploads = [...prev];
      newUploads[index].isValidated = true;
      return newUploads;
    });

    try {
      const cleanUploads = newUploads.map(({ loading, ...rest }) => rest);
      await syncProofsToFirestore(cleanUploads);
    } catch (err) {
      console.error("Erreur de validation individuelle :", err);
    } finally {
      newUploads[index].loading = false;
      setUploads([...newUploads]);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const newUploads = [...uploads];
        for (const asset of result.assets) {
          newUploads.push({
            image: asset.uri,
            likes: 0,
            shares: 0,
            isValidated: true
          });
        }
        setUploads(newUploads);
        await syncProofsToFirestore(newUploads);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      Alert.alert("Erreur", "Impossible d'uploader l'image");
    }
  };

  const handleDeleteUpload = async (index: number) => {
    const newUploads = [...uploads];
    newUploads.splice(index, 1);
    setUploads(newUploads);
    await syncProofsToFirestore(newUploads);
  };

  const handleUpdateField = async (index: number, field: "likes" | "shares", value: number) => {
    const updated = [...uploads];
    updated[index][field] = value;
    setUploads(updated);
    await syncProofsToFirestore(updated);
  };

  const handleUndoMarkAsDone = async () => {
    if (loading || status !== "Approbation") return;
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!deal || !userId) throw new Error("Utilisateur non connecté");

      const updatedCandidatures = deal.candidatures.map((cand: any) =>
        cand.influenceurId === userId ? { ...cand, status: "Accepté" } : cand
      );

      await updateDoc(doc(db, "deals", deal.id), { candidatures: updatedCandidatures });
      setStatus("Accepté");
    } catch (error) {
      console.error("Erreur lors du retour à l'état 'Accepté' :", error);
      Alert.alert("Erreur", "Impossible de revenir à l'état précédent");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = async () => {
    if (loading || status !== "Accepté") return;
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!deal || !userId) throw new Error("Utilisateur non connecté");

      const updatedCandidatures = deal.candidatures.map((cand: any) =>
        cand.influenceurId === userId ? { ...cand, status: "Approbation", proofs: uploads } : cand
      );

      await updateDoc(doc(db, "deals", deal.id), { candidatures: updatedCandidatures });

      await sendNotification({
        toUserId: deal.merchantId,
        fromUserId: userId,
        message: "L'influenceur a terminé sa mission et attend votre validation.",
        relatedDealId: deal.id,
        targetRoute: "/suividealscommercant",
        type: "approval_request",
      });

      setStatus("Approbation");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du deal :", error);
      Alert.alert("Erreur", "Impossible de marquer comme terminé");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    const stepMap: any = {
      "Envoyé": 1,
      "Accepté": 2,
      "Approbation": 3,
      "Terminé": 4
    };
    return stepMap[status] || 1;
  };

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
                {deal.interests ? (
                  <View style={styles.interestTag}>
                    <Text style={styles.interestText}>{deal.interest}</Text>
                  </View>
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

        </View>

        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>État de la candidature</Text>
          <ProgressRibbon currentStep={getCurrentStep()} status={status} />
        </View>

        {status === "Accepté" && (
          <View style={styles.proofsSection}>
            <Text style={styles.proofsTitle}>Preuves de réalisation</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImageUpload}
            >
              <Text style={styles.uploadButtonText}>Ajouter des images</Text>
            </TouchableOpacity>

            {uploads.map((upload, i) => {
              const isValid = upload.likes > 0 && upload.shares > 0 && upload.image;

              return (
                <View key={i} style={styles.uploadContainer}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: upload.image }}
                      style={styles.uploadImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUpload(i)}
                    >
                      <Icon name="delete" size={20} color="#FF6B2E" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statInput}>
                      <Text style={styles.statLabel}>Nombre de likes</Text>
                      <TextInput
                        style={styles.statInputField}
                        keyboardType="numeric"
                        value={upload.likes.toString()}
                        onChangeText={(value) => handleUpdateField(i, "likes", parseInt(value) || 0)}
                      />
                    </View>
                    <View style={styles.statInput}>
                      <Text style={styles.statLabel}>Nombre de partages</Text>
                      <TextInput
                        style={styles.statInputField}
                        keyboardType="numeric"
                        value={upload.shares.toString()}
                        onChangeText={(value) => handleUpdateField(i, "shares", parseInt(value) || 0)}
                      />
                    </View>
                  </View>

                  {!isValid && !upload.isValidated && (
                    <Text style={styles.validationError}>
                      Veuillez remplir tous les champs pour valider.
                    </Text>
                  )}

                  {isValid && !upload.isValidated && (
                    <TouchableOpacity
                    style={[styles.validateButton, upload.loading && styles.disabledButton]}
                    onPress={() => handleValidateUpload(i)}
                    disabled={upload.loading}
                    >
                      <Text style={styles.validateButtonText}>
                        {upload.loading ? "Validation..." : "Valider cet upload"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {upload.isValidated && (
                    <Text style={styles.validatedText}>Upload validé ✅</Text>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.doneButton, loading && styles.disabledButton]}
              onPress={handleMarkAsDone}
              disabled={loading}
            >
              <Text style={styles.doneButtonText}>
                {loading ? "Envoi..." : "Marquer comme terminé"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "Approbation" && (
          <View style={styles.approvalSection}>
            <TouchableOpacity 
              style={styles.pendingButton}
              disabled
            >
              <Text style={styles.pendingButtonText}>En attente d'approbation</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.undoButton}
              onPress={handleUndoMarkAsDone}
              disabled={loading}
            >
              <Text style={styles.undoButtonText}>
                {loading ? "Retour..." : "Marquer comme non terminé"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "Refusé" && (
          <View style={styles.refusedSection}>
            <TouchableOpacity
              style={styles.refusedButton}
              disabled
            >
              <Text style={styles.refusedButtonText}>Candidature Refusée</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "Terminé" && candidature?.influreview && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Avis laissé</Text>
            <Text style={styles.reviewText}>"{candidature.influreview.comment}"</Text>
          </View>
        )}

        {status === "Terminé" && (
          <View style={styles.reviewButtonSection}>
            <TouchableOpacity
              style={[styles.reviewButton, hasReviewed && styles.disabledButton]}
              onPress={() => !hasReviewed && navigation.navigate('ReviewScreen', { dealId: deal.id })}
              disabled={hasReviewed}
            >
              <Text style={styles.reviewButtonText}>
                {hasReviewed ? "Déjà évalué" : "Noter le commerçant"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Historique</Text>
          <View style={styles.timelineContainer}>
            {timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineText}>{event.text}</Text>
                  <Text style={styles.timelineDate}>{event.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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
    marginBottom: 20,
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
  statusSection: {
    padding: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 12,
  },
  progressContainer: {
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    padding: 12,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    color: '#FF6B2E',
    fontSize: 12,
    opacity: 0.7,
  },
  activeStepText: {
    opacity: 1,
    fontWeight: 'bold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#FF6B2E',
    opacity: 0.3,
    marginHorizontal: 4,
  },
  activeStepLine: {
    opacity: 1,
  },
  refusedRibbon: {
    backgroundColor: '#FF0000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  refusedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  proofsSection: {
    padding: 16,
  },
  proofsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
    marginBottom: 12,
  },
  statInput: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 4,
  },
  statInputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 8,
  },
  validationError: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  validateButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  validatedText: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  approvalSection: {
    padding: 16,
    gap: 12,
  },
  pendingButton: {
    backgroundColor: '#CCCCCC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pendingButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  undoButton: {
    borderWidth: 2,
    borderColor: '#FF6B2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  undoButtonText: {
    color: '#FF6B2E',
    fontWeight: '600',
  },
  refusedSection: {
    padding: 16,
  },
  refusedButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refusedButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reviewSection: {
    padding: 16,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  reviewButtonSection: {
    padding: 16,
  },
  reviewButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timelineSection: {
    padding: 16,
    marginBottom: 80,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C24',
    marginBottom: 16,
  },
  timelineContainer: {
    backgroundColor: '#F5F5E7',
    borderRadius: 8,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1A2C24',
    marginRight: 16,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  timelineDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
});