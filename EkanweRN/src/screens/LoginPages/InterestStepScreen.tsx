import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { auth, db } from '../../firebase/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'InterestStep'>;

const baseTags = [
  'Mode', 'Cuisine', 'Voyage', 'Beauté', 'Sport', 'Technologie', 'Gaming',
  'Musique', 'Cinéma', 'Fitness', 'Développement personnel', 'Finance',
  'Photographie', 'Lecture', 'Art', 'Éducation', 'Animaux', 'Nature', 'Business'
];

const suggestions: Record<string, string[]> = {
  'Mode': ['Vintage', 'Haute couture', 'Streetwear', 'Accessoires', 'Shoes', 'Fashion Week'],
  'Cuisine': ['Street food', 'Vegan', 'Desserts', 'Plats africains', 'Recettes rapides', 'Cuisine du monde', 'Healthy'],
  'Voyage': ['Afrique', 'Europe', 'Asie', 'Roadtrip', 'Aventures', 'Destinations insolites', 'Travel vlog'],
  'Gaming': ['Esport', 'Indie Games', 'Streaming', 'Jeux mobile', 'MMORPG', 'Jeux de stratégie', 'Rétrogaming'],
  'Sport': ['Football', 'Basketball', 'Yoga', 'Boxe', 'Danse', 'Cyclisme', 'Musculation', 'Arts martiaux'],
  'Beauté': ['Soins du visage', 'Make-up', 'Routine', 'Produits naturels', 'Coiffure', 'Parfums'],
  'Musique': ['Afrobeats', 'Rap', 'Jazz', 'DJing', 'Production musicale', 'Gospel', 'Pop', 'Rock'],
  'Cinéma': ['Films africains', 'Netflix', 'Séries', 'Critique ciné', 'Documentaires', 'Acteurs', 'Animation'],
  'Fitness': ['HIIT', 'Cardio', 'Entraînement maison', 'Plan nutrition', 'Transformation physique', 'Fitness challenges'],
  'Développement personnel': ['Motivation', 'Gestion du temps', 'Productivité', 'Mindset', 'Lecture utile', 'Spiritualité'],
  'Finance': ['Crypto', 'Investissement', 'Épargne', 'Comptabilité', 'Finance perso', 'Bourse', 'Budgeting'],
  'Photographie': ['Portrait', 'Paysage', 'Édition photo', 'Matériel', 'Mobile photography', 'Inspiration visuelle'],
  'Lecture': ['Romans', 'Mangas', 'Livres business', 'Développement perso', 'Fantasy', 'Policiers', 'Poésie'],
  'Art': ['Dessin', 'Peinture', 'Graffiti', 'Sculpture', 'Art numérique', 'Expositions', 'Art africain'],
  'Éducation': ['Astuce d\'étude', 'Méthodes d\'apprentissage', 'Préparation d\'examens', 'Orientation', 'Cours en ligne', 'Tutoring'],
  'Animaux': ['Chiens', 'Chats', 'Animaux exotiques', 'Adoption', 'Dressage', 'Soins vétérinaires'],
  'Nature': ['Randonnée', 'Écologie', 'Plantes', 'Forêts', 'Paysages', 'Nature urbaine', 'Camping'],
  'Business': ['Entrepreneuriat', 'Marketing digital', 'E-commerce', 'Branding', 'Stratégie', 'Startups', 'Networking'],
  'Technologie': ['IA', 'Startups tech', 'Applications', 'Innovation', 'Mobile', 'Web', 'Gadgets'],
};

export const InterestStepScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [customInput, setCustomInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([...baseTags]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const prefill = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.interets) setSelectedTags(data.interets);
      }
    };
    prefill();
  }, []);

  const toggleTag = (tag: string) => {
    const alreadySelected = selectedTags.includes(tag);
    if (alreadySelected) {
      setSelectedTags((prev) => prev.filter(t => t !== tag));
      if (suggestions[tag]) {
        setAvailableTags((prev) => prev.filter(t => !suggestions[tag].includes(t)));
      }
    } else {
      setSelectedTags((prev) => [...prev, tag]);
      if (suggestions[tag]) {
        const newTags = suggestions[tag].filter(s => !availableTags.includes(s));
        setAvailableTags((prev) => [...prev, ...newTags]);
      }
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('Erreur', 'Utilisateur non connecté');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        interets: selectedTags,
        inscription: '3',
      });
      navigation.navigate('SocialConnect');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'enregistrer vos centres d\'intérêt.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.step}>Étape 2/4</Text>
      <Text style={styles.title}>Centres d'intérêt</Text>

      <Text style={styles.sub}>
        Tu ne vois pas ce que tu cherches ?{' '}
        <Text style={{ fontWeight: 'bold', color: 'white' }}>Ajoute ton propre centre d’intérêt</Text>
      </Text>

      <TextInput
        placeholder="Ajouter un centre d'intérêt"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={customInput}
        onChangeText={setCustomInput}
      />

      {customInput && !availableTags.includes(customInput) && (
        <TouchableOpacity
          onPress={() => {
            setAvailableTags((prev) => [...prev, customInput]);
            setSelectedTags((prev) => [...prev, customInput]);
            setCustomInput('');
          }}
        >
          <Text style={styles.addText}>➕ Ajouter "{customInput}"</Text>
        </TouchableOpacity>
      )}

      <View style={styles.tagsContainer}>
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              selectedTags.includes(tag) && styles.tagSelected,
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.btnText}>RETOUR</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={styles.nextBtn}>
          <Text style={styles.btnText}>SUIVANT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1A2C24',
    padding: 20,
  },
  step: {
    textAlign: 'right',
    color: '#ccc',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 14,
    textAlign: 'center',
  },
  input: {
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: 'white',
    marginBottom: 12,
  },
  addText: {
    color: '#FBBF24',
    textAlign: 'center',
    marginBottom: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  tag: {
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  tagSelected: {
    backgroundColor: '#FF6B2E',
    borderColor: '#FF6B2E',
  },
  tagText: {
    color: 'white',
    fontSize: 13,
  },
  tagTextSelected: {
    color: '#1A2C24',
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  nextBtn: {
    backgroundColor: '#FF6B2E',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
  },
});
