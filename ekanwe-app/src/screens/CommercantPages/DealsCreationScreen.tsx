import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, Alert, Platform, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import {
  collection, addDoc, serverTimestamp, getDocs, query, where, writeBatch, doc
} from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sendNotificationToToken } from '../../hooks/sendNotifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from 'firebase/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DealsCreation'>;


export const DealsCreationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [validUntil, setValidUntil] = useState('');
  const [conditions, setConditions] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 5.35,
    longitude: -4.01,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const availableInterests = ["Mode", "Cuisine", "Voyage", "Beauté", "Sport", "Technologie", "Gaming",
    "Musique", "Cinéma", "Fitness", "Développement personnel", "Finance",
    "Photographie", "Lecture", "Art", "Éducation", "Animaux", "Nature", "Business"
  ];
  const availableTypes = ["Post Instagram", "Story Instagram", "Vidéo TikTok", "Vidéo Youtube", "Publication Facebook", "Autre"];

  const toggleSelection = (item: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPosition({ lat: latitude, lng: longitude });
    setLocationName(await getLocationName(latitude, longitude));
  };

  const getInfluenceursTokens = async (): Promise<string[]> => {
    const q = query(collection(db, "users"), where("role", "==", "influenceur"));
    const snapshot = await getDocs(q);
    const tokens: string[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.expoPushToken) {
        tokens.push(data.expoPushToken);
      }
    });

    return tokens;
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    let result = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (result.length > 0) {
      const place = result[0];
      return `${place.city}, ${place.country}`;
    }
    return "Inconnu";
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // ✅ On envoie directement au Storage
        const downloadURL = await uploadDealImageToFirebase(uri);

        if (downloadURL) {
          // ✅ Mettre l’URL Firebase dans ton state
          setImageUri(downloadURL);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la sélection de l'image");
    }
  };

  const uploadDealImageToFirebase = async (uri: string): Promise<string | null> => {
    try {
      const storageInstance = getStorage();
      const filename = `${auth.currentUser?.uid}_${Date.now()}.jpg`;
      const reference = ref(storageInstance, `profileImages/${filename}`);

      // ✅ Convertir file:// en blob avec fetch (nouvelle méthode Expo)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload
      await uploadBytes(reference, blob);

      // URL publique
      const url = await getDownloadURL(reference);
      return url;
    } catch (error) {
      console.error("❌ Erreur upload Firebase Storage:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !validUntil || !conditions || !imageUri || !position || selectedInterests.length === 0 || selectedTypes.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis.');
      return;
    }

    try {
      setLoading(true);

      let uploadedImageUrl = imageUri;

      if (imageUri && imageUri.startsWith('file://')) {
        const url = await uploadDealImageToFirebase(imageUri);
        if (url) uploadedImageUrl = url;
      }

      const docRef = await addDoc(collection(db, 'deals'), {
        title,
        description,
        validUntil,
        conditions,
        interests: selectedInterests,
        typeOfContent: selectedTypes,
        imageUrl: uploadedImageUrl,
        locationCoords: { lat: position.lat, lng: position.lng },
        locationName,
        merchantId: auth.currentUser?.uid,
        status: 'active',
        candidatures: [],
        createdAt: serverTimestamp(),
      });

      const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'influenceur')));
      const batch = writeBatch(db);

      snapshot.forEach(userDoc => {
        const notifRef = doc(collection(db, 'users', userDoc.id, 'notifications'));
        batch.set(notifRef, {
          message: 'Un nouveau deal est disponible !',
          type: 'new_deal',
          fromUserId: auth.currentUser?.uid,
          relatedDealId: docRef.id,
          targetRoute: 'DealsSeeMoreInfluenceur',
          dealId: docRef.id,
          read: false,
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();
      const tokens = await getInfluenceursTokens();

      for (const token of tokens) {
        await sendNotificationToToken(
          token,
          "Nouveau deal disponible 🎉",
          "Un commerçant a publié une nouvelle opportunité !",
          { screen: "DealsSeeMoreInfluenceur" }
        );
      }
      navigation.navigate('DealsCommercant' as never);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Erreur lors de la création du deal.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setPosition({ lat: latitude, lng: longitude });
        setLocationName(await getLocationName(latitude, longitude));
      } else {
        Alert.alert('Erreur', 'Adresse non trouvée');
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      Alert.alert('Erreur', 'Impossible de trouver cette adresse');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      try {
        setSelectedDate(date);
        setValidUntil(format(date, 'yyyy-MM-dd'));
      } catch (error) {
        console.error('Erreur lors du changement de date:', error);
      }
    }
  };

  const handleDateConfirm = () => {
    try {
      setValidUntil(format(selectedDate, 'yyyy-MM-dd'));
    } catch (error) {
      console.error('Erreur lors de la confirmation de la date:', error);
    }
    setShowDatePicker(false);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La permission de localisation est nécessaire pour utiliser la carte.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14210F" />
          </TouchableOpacity>
          <Text style={styles.title}>Créer un Deal</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationsCommercant')}>
            <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri || 'https://via.placeholder.com/600x200' }}
          style={styles.image}
        />
        <Text style={styles.imageText}>📸 Ajouter une image</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titre du deal" />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Décrivez le deal"
        multiline
      />

      <Text style={styles.label}>Intérêts</Text>
      <View style={styles.tagContainer}>
        {availableInterests.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, selectedInterests.includes(tag) && styles.tagSelected]}
            onPress={() => toggleSelection(tag, selectedInterests, setSelectedInterests)}
          >
            <Text style={selectedInterests.includes(tag) ? styles.tagTextSelected : styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Type de contenu</Text>
      <View style={styles.tagContainer}>
        {availableTypes.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, selectedTypes.includes(tag) && styles.tagSelected]}
            onPress={() => toggleSelection(tag, selectedTypes, setSelectedTypes)}
          >
            <Text style={selectedTypes.includes(tag) ? styles.tagTextSelected : styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Date de validité</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={validUntil ? styles.dateText : styles.datePlaceholder}>
          {validUntil || 'Sélectionner une date'}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButton}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.modalButton}>OK</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
                locale="fr-FR"
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            locale="fr-FR"
          />
        )
      )}

      <Text style={styles.label}>Conditions</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={conditions}
        onChangeText={setConditions}
        placeholder="Conditions du deal"
        multiline
      />

      <Text style={styles.label}>Localisation</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher une adresse..."
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#FF6B2E" />
          ) : (
            <Ionicons name="search" size={24} color="#FF6B2E" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
        >
          {position && (
            <Marker
              coordinate={{
                latitude: position.lat,
                longitude: position.lng,
              }}
              title="Position choisie"
            />
          )}
        </MapView>
      </View>

      <View style={styles.tagContainer}>
        {position ? (
          <Text style={styles.locationText}>
            {locationName || `Latitude: ${position.lat.toFixed(5)} / Longitude: ${position.lng.toFixed(5)}`}
          </Text>
        ) : (
          <Text style={styles.locationText}>Touchez la carte ou recherchez une adresse</Text>
        )}
      </View>

      <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>EXÉCUTER</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 80,
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F'
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8
  },
  imageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF6B2E'
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 4,
    color: '#1A2C24'
  },
  icon: {
    width: 24,
    height: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 8,
    marginTop: 8,
  },
  tagSelected: {
    backgroundColor: '#FF6B2E',
    borderColor: '#FF6B2E'
  },
  tagText: {
    color: '#1A2C24'
  },
  tagTextSelected: {
    color: '#fff'
  },
  fakeMap: {
    height: 60,
    backgroundColor: '#1A2C24',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submit: {
    marginTop: 24,
    backgroundColor: '#FF6B2E',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    paddingBottom: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  mapContainer: {
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#1A2C24',
    marginTop: 8,
    textAlign: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
  },
  dateText: {
    color: '#1A2C24',
  },
  datePlaceholder: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalButton: {
    color: '#FF6B2E',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
  },
});
