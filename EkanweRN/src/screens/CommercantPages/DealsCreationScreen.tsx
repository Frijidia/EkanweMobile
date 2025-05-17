import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/firebase';
import {
  collection, addDoc, serverTimestamp, getDocs, query, where, writeBatch, doc
} from 'firebase/firestore';

export const DealsCreationScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [validUntil, setValidUntil] = useState('');
  const [conditions, setConditions] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [position, setPosition] = useState<any>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);

  const availableInterests = ["Mode", "Cuisine", "Voyage", "Beauté", "Sport", "Technologie", "Gaming"];
  const availableTypes = ["Post Instagram", "Story Instagram", "Vidéo TikTok", "Autre"];

  const toggleSelection = (item: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !validUntil || !conditions || !imageUri || !position || selectedInterests.length === 0 || selectedTypes.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis.');
      return;
    }

    try {
      setLoading(true);

      const docRef = await addDoc(collection(db, 'deals'), {
        title,
        description,
        validUntil,
        conditions,
        interests: selectedInterests,
        typeOfContent: selectedTypes,
        imageUrl: imageUri,
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
          targetRoute: `/dealsseemoreinfluenceur/${docRef.id}`,
          read: false,
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();
      navigation.navigate('DealsCommercant' as never);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Erreur lors de la création du deal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
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
      <TextInput style={styles.input} value={validUntil} onChangeText={setValidUntil} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>Conditions</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={conditions}
        onChangeText={setConditions}
        placeholder="Conditions du deal"
        multiline
      />

      {/* TODO: Ajouter une vraie map de localisation ici plus tard */}
      <Text style={styles.label}>Localisation (simulée)</Text>
      <TouchableOpacity
        onPress={() => {
          setPosition({ lat: 5.35, lng: -4.01 });
          setLocationName("Abidjan, Côte d'Ivoire");
        }}
        style={styles.fakeMap}
      >
        <Text style={{ color: '#fff' }}>📍 Cliquer ici pour simuler la localisation</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>EXÉCUTER</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5E7' },
  imageContainer: { alignItems: 'center', marginBottom: 16 },
  image: { width: '100%', height: 180, borderRadius: 8 },
  imageText: { marginTop: 8, fontSize: 14, color: '#FF6B2E' },
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 16, marginBottom: 4, color: '#1A2C24' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 8,
    marginTop: 8,
  },
  tagSelected: { backgroundColor: '#FF6B2E', borderColor: '#FF6B2E' },
  tagText: { color: '#1A2C24' },
  tagTextSelected: { color: '#fff' },
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
  },
  submitText: { color: '#fff', fontWeight: 'bold' },
});
