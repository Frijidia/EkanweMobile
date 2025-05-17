import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { auth, db } from '../firebase/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SocialConnectStep'>;

export const SocialConnectStepScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    instagram: '',
    tiktok: '',
  });

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
            instagram: data.instagram || '',
            tiktok: data.tiktok || '',
          });
        }
      } catch (error) {
        console.error('Erreur chargement réseaux :', error);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('Erreur', 'Utilisateur non connecté.');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        inscription: '4',
      });
      navigation.navigate('PortfolioStep');
    } catch (err) {
      console.error('Erreur enregistrement réseaux :', err);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.step}>Étape 3/4</Text>

      <Image
        source={require('../assets/ekanwe-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.heading}>Connexion réseaux</Text>

      <View style={styles.inputGroup}>
        <Image
          source={require('../assets/instagramlogo.png')}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Lien ou pseudo Instagram"
          placeholderTextColor="#888"
          value={formData.instagram}
          onChangeText={(text) => handleChange('instagram', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Image
          source={require('../assets/tiktoklogo.png')}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Lien ou pseudo TikTok"
          placeholderTextColor="#888"
          value={formData.tiktok}
          onChangeText={(text) => handleChange('tiktok', text)}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>RETOUR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleSubmit}>
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
    justifyContent: 'center',
  },
  step: {
    color: '#ccc',
    textAlign: 'right',
    fontSize: 12,
    marginBottom: 10,
  },
  logo: {
    width: 140,
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: 'black',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  backBtn: {
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextBtn: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
  },
});
