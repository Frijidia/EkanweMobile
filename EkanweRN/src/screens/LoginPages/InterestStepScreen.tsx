import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const baseTags = [
  "Mode", "Cuisine", "Voyage", "Beauté", "Sport", "Technologie", "Gaming",
  "Musique", "Cinéma", "Fitness", "Développement personnel", "Finance",
  "Photographie", "Lecture", "Art", "Éducation", "Animaux", "Nature", "Business"
];

const suggestions: Record<string, string[]> = {
  "Mode": ["Vintage", "Haute couture", "Streetwear", "Accessoires", "Shoes", "Fashion Week"],
  "Cuisine": ["Street food", "Vegan", "Desserts", "Plats africains", "Recettes rapides", "Cuisine du monde", "Healthy"],
  "Voyage": ["Afrique", "Europe", "Asie", "Roadtrip", "Aventures", "Destinations insolites", "Travel vlog"],
  "Gaming": ["Esport", "Indie Games", "Streaming", "Jeux mobile", "MMORPG", "Jeux de stratégie", "Rétrogaming"],
  "Sport": ["Football", "Basketball", "Yoga", "Boxe", "Danse", "Cyclisme", "Musculation", "Arts martiaux"],
  "Beauté": ["Soins du visage", "Make-up", "Routine", "Produits naturels", "Coiffure", "Parfums"],
  "Musique": ["Afrobeats", "Rap", "Jazz", "DJing", "Production musicale", "Gospel", "Pop", "Rock"],
  "Cinéma": ["Films africains", "Netflix", "Séries", "Critique ciné", "Documentaires", "Acteurs", "Animation"],
  "Fitness": ["HIIT", "Cardio", "Entraînement maison", "Plan nutrition", "Transformation physique", "Fitness challenges"],
  "Développement personnel": ["Motivation", "Gestion du temps", "Productivité", "Mindset", "Lecture utile", "Spiritualité"],
  "Finance": ["Crypto", "Investissement", "Épargne", "Comptabilité", "Finance perso", "Bourse", "Budgeting"],
  "Photographie": ["Portrait", "Paysage", "Édition photo", "Matériel", "Mobile photography", "Inspiration visuelle"],
  "Lecture": ["Romans", "Mangas", "Livres business", "Développement perso", "Fantasy", "Policiers", "Poésie"],
  "Art": ["Dessin", "Peinture", "Graffiti", "Sculpture", "Art numérique", "Expositions", "Art africain"],
  "Éducation": ["Astuce d'étude", "Méthodes d'apprentissage", "Préparation d'examens", "Orientation", "Cours en ligne", "Tutoring"],
  "Animaux": ["Chiens", "Chats", "Animaux exotiques", "Adoption", "Dressage", "Soins vétérinaires"],
  "Nature": ["Randonnée", "Écologie", "Plantes", "Forêts", "Paysages", "Nature urbaine", "Camping"],
  "Business": ["Entrepreneuriat", "Marketing digital", "E-commerce", "Branding", "Stratégie", "Startups", "Networking"],
  "Technologie": ["IA", "Startups tech", "Applications", "Innovation", "Mobile", "Web", "Gadgets"]
};

export const InterestStepScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [customInput, setCustomInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([...baseTags]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    const isSelected = selectedTags.includes(tag);

    if (isSelected) {
      setSelectedTags(prev => prev.filter(t => t !== tag));

      if (suggestions[tag]) {
        setAvailableTags(prev =>
          prev.filter(t => !suggestions[tag].includes(t))
        );
      }
    } else {
      setSelectedTags(prev => [...prev, tag]);

      if (suggestions[tag]) {
        setAvailableTags(prev => {
          const newTags = suggestions[tag].filter(s => !prev.includes(s));
          return [...prev, ...newTags];
        });
      }
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('SocialConnect');
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.stepIndicator}>2/4</Text>

        <View style={styles.header}>
          <Image 
            source={require('../../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.inscriptionText}>Inscription</Text>
          <Text style={styles.title}>Centre d'intérêt</Text>
          <Text style={styles.subtitle}>
            Tu ne vois pas ce que tu cherches ?{' '}
            <Text style={styles.subtitleBold}>
              Ajoute ton propre centre d'intérêt
            </Text>
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={customInput}
            onChangeText={setCustomInput}
            placeholder="Rechercher ou ajouter un centre d'intérêt"
            placeholderTextColor="#9CA3AF"
          />
          {customInput && !availableTags.includes(customInput) && (
            <TouchableOpacity
              onPress={() => {
                setAvailableTags(prev => [...prev, customInput]);
                setSelectedTags(prev => [...prev, customInput]);
                setCustomInput("");
              }}
            >
              <Text style={styles.addCustomText}>
                Ajouter "{customInput}" comme centre d'intérêt
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tagsContainer}>
          {availableTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tagButton,
                selectedTags.includes(tag) && styles.selectedTag
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.selectedTagText
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('RegistrationStepOne')}
          >
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>SUIVANT</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  content: {
    padding: 16,
  },
  stepIndicator: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 144,
    height: 144,
    marginBottom: 24,
  },
  inscriptionText: {
    color: '#9CA3AF',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  subtitleBold: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    color: '#fff',
    padding: 12,
    fontSize: 14,
  },
  addCustomText: {
    color: '#FFA500',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: '#FF6B2E',
    borderColor: '#FF6B2E',
  },
  tagText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedTagText: {
    color: '#1A2C24',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 80,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});