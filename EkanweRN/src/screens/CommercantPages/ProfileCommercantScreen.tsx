import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export const ProfileCommercantScreen = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [pseudonyme, setPseudonyme] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setPseudonyme(data.pseudonyme || '');
        setPrenom(data.prenom || '');
        setNom(data.nom || '');
        setPhone(data.phone || '');
        setDateNaissance(data.dateNaissance || '');
        setInstagram(data.instagram || '');
        setTiktok(data.tiktok || '');
        setPortfolioLink(data.portfolioLink || '');
        setBio(data.bio || '');
        setProfileImage(data.photoURL || null);
      }
    };

    fetchUserInfo();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        pseudonyme,
        prenom,
        nom,
        phone,
        dateNaissance,
        instagram,
        tiktok,
        portfolioLink,
        bio,
        photoURL: profileImage || '',
      });
      setMessage('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur de mise à jour du profil :', error);
      setMessage('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      Alert.alert('Erreur', 'Erreur de déconnexion.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
          <Image source={require('../../assets/ekanwesign.png')} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: profileImage || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Input label="Pseudonyme" value={pseudonyme} setValue={setPseudonyme} />
        <Input label="Prénom" value={prenom} setValue={setPrenom} />
        <Input label="Nom" value={nom} setValue={setNom} />
        <Input label="Date de Naissance" value={dateNaissance} setValue={setDateNaissance} />
        <Input label="Téléphone" value={phone} setValue={setPhone} />
        <Input label="Instagram" value={instagram} setValue={setInstagram} />
        <Input label="TikTok" value={tiktok} setValue={setTiktok} />
        <Input label="Lien de Portfolio" value={portfolioLink} setValue={setPortfolioLink} />
        <Input label="Bio" value={bio} setValue={setBio} multiline />
      </View>

      {message && (
        <Text style={[styles.message, message.includes('succès') ? styles.successMessage : styles.errorMessage]}>
          {message}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        style={[styles.button, loading ? styles.disabledButton : styles.saveButton]}
      >
        <Text style={styles.buttonText}>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.button, styles.logoutButton]}
      >
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Input({ label, value, setValue, multiline = false }) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        style={styles.input}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5E7',
    minHeight: '100%',
    paddingTop: 40,
    paddingBottom: 20,
    padding: 10

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    color: '#1A2C24',
    fontWeight: 'bold',
  },
  logo: {
    width: 24,
    height: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  label: {
    color: '#1A2C24',
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 14,
  },
  message: {
    textAlign: 'center',
    marginTop: 16,
  },
  successMessage: {
    color: '#22C55E',
  },
  errorMessage: {
    color: '#EF4444',
  },
  button: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: '#1A2C24',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
