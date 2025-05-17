import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePageCommercant() {
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
    <ScrollView className="bg-[#F5F5E7] min-h-screen px-4 py-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl text-[#1A2C24] font-bold">Mon Profil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
          <Image source={require('../../assets/ekanwesign.png')} className="w-6 h-6" />
        </TouchableOpacity>
      </View>

      <View className="items-center mb-6">
        <TouchableOpacity onPress={pickImage} className="relative">
          <Image source={{ uri: profileImage || 'https://via.placeholder.com/100' }} className="w-24 h-24 rounded-full" />
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
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
        <Text className={`text-center mt-4 ${message.includes('succès') ? 'text-green-600' : 'text-red-500'}`}>{message}</Text>
      )}

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        className={`w-full py-3 rounded-lg mt-6 ${loading ? 'bg-gray-400' : 'bg-[#1A2C24]'}`}
      >
        <Text className="text-white text-center font-bold text-lg">{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        className="w-full bg-red-500 py-3 rounded-lg mt-4"
      >
        <Text className="text-white text-center font-bold text-lg">Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Input({ label, value, setValue, multiline = false }) {
  return (
    <View>
      <Text className="text-[#1A2C24] font-medium mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );
}
