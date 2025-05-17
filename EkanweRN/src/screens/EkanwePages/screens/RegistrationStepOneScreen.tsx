import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrationStepOne'>;

export const RegistrationStepOneScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    naissance: '',
    pseudo: '',
    telephone: '',
  });
  const [pseudoError, setPseudoError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            nom: data.nom || '',
            prenoms: data.prenom || '',
            naissance: data.dateNaissance || '',
            pseudo: data.pseudonyme || '',
            telephone: data.phone || '',
          });
        }
      } catch (err) {
        console.error('Erreur chargement données :', err);
      }
    };

    fetchUserData();
  }, []);

  const checkPseudoUnique = async (pseudo: string) => {
    setIsChecking(true);
    const q = query(collection(db, 'users'), where('pseudonyme', '==', pseudo));
    const snapshot = await getDocs(q);
    setPseudoError(snapshot.empty ? '' : 'Pseudonyme déjà utilisé');
    setIsChecking(false);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'pseudo') checkPseudoUnique(value.trim());
  };

  const handleSubmit = async () => {
    const { nom, prenoms, naissance, pseudo, telephone } = formData;
    if (!nom || !prenoms || !naissance || !pseudo || !telephone || pseudoError) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement.');
      return;
    }

    const user = auth.currentUser;
    if (!user) return Alert.alert('Erreur', 'Utilisateur non connecté');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        nom,
        prenom: prenoms,
        dateNaissance: naissance,
        pseudonyme: pseudo,
        phone: telephone,
        inscription: '2',
      });
      navigation.navigate('InterestStep');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.step}>Étape 1/4</Text>
      <Text style={styles.title}>Informations</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom"
        placeholderTextColor="#ccc"
        value={formData.nom}
        onChangeText={(text) => handleChange('nom', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Prénoms"
        placeholderTextColor="#ccc"
        value={formData.prenoms}
        onChangeText={(text) => handleChange('prenoms', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Pseudonyme"
        placeholderTextColor="#ccc"
        value={formData.pseudo}
        onChangeText={(text) => handleChange('pseudo', text)}
      />
      {pseudoError ? <Text style={styles.error}>{pseudoError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Date de naissance (AAAA-MM-JJ)"
        placeholderTextColor="#ccc"
        value={formData.naissance}
        onChangeText={(text) => handleChange('naissance', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Téléphone"
        placeholderTextColor="#ccc"
        keyboardType="phone-pad"
        value={formData.telephone}
        onChangeText={(text) => handleChange('telephone', text)}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('LoginOrSignup')}>
          <Text style={styles.backText}>RETOUR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !(formData.pseudo && !pseudoError) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={isChecking}
        >
          {isChecking ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>SUIVANT</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2C24',
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  step: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'right',
  },
  input: {
    borderColor: 'white',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    color: 'white',
  },
  error: {
    color: '#f87171',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backBtn: {
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  backText: {
    color: 'white',
    fontSize: 14,
  },
  nextBtn: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  nextText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
