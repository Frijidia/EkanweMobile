import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profileImage, setProfileImage] = useState<any>(null);
  const [pseudonyme, setPseudonyme] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState<any>(false);
  const [message, setMessage] = useState<any>(null);
  const MAX_BASE64_SIZE = 1024 * 1024;

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
      const base64Image = result.assets[0].base64!;
      const mimeType = result.assets[0].type || 'image/jpeg';
      const fullBase64 = `data:${mimeType};base64,${base64Image}`;
      setProfileImage(fullBase64);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      let imageBase64 = null;

      if (profileImage && profileImage.startsWith('file://')) {
        imageBase64 = await getBase64FromUri(profileImage);
      }
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
        photoURL: imageBase64 || profileImage || '',
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
      navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      Alert.alert('Erreur', 'Erreur de déconnexion.');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirmer la suppression",
      "Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;
              await deleteDoc(doc(db, "users", user.uid));
              await user.delete();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              });
            } catch (error) {
              Alert.alert("Demande de suppression envoyé à l'admin. Votre demande peut prendre entre 3 - 4 jours !");
            }
          },
        },
      ]
    );
  };

  const handleImageClick = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la caméra.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled) {
        if (result.assets?.[0].base64!.length * 0.75 > MAX_BASE64_SIZE) {
          Alert.alert(
            "Image trop lourde",
            "L'image dépasse la taille maximale autorisée (1 Mo). Essaie une image plus légère ou compresse-la."
          );
        } else {
          const base64Image = result.assets[0].base64!;
          const mimeType = result.assets[0].type || 'image/jpeg';
          const fullBase64 = `data:${mimeType};base64,${base64Image}`;
          setProfileImage(fullBase64);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la prise de photo:", error);
      setMessage("Erreur lors de la prise de photo");
    }
  };

  const handleGalleryClick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la galerie.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled) {
        if (result.assets?.[0].base64!.length * 0.75 > MAX_BASE64_SIZE) {
          Alert.alert(
            "Image trop lourde",
            "L'image dépasse la taille maximale autorisée (1 Mo). Essaie une image plus légère ou compresse-la."
          );
        } else {
          const base64Image = result.assets[0].base64!;
          const mimeType = result.assets[0].type || 'image/jpeg';
          const fullBase64 = `data:${mimeType};base64,${base64Image}`;
          setProfileImage(fullBase64);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      setMessage("Erreur lors de la sélection de l'image");
    }
  };

  const getBase64FromUri = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14210F" />
          </TouchableOpacity>
          <Text style={styles.title}>Mon Profil</Text>
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

      <View style={styles.imageContainer}>
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="camera" size={30} color="#FF6B2E" />
            </View>
          )}
        </View>
        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleImageClick}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGalleryClick}
          >
            <Ionicons name="images" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#1A2C24',
    fontWeight: 'bold',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginRight: 8,
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
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#FF6B2E',
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePickerButton: {
    position: 'relative',
    marginBottom: 8,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    backgroundColor: '#FF6B2E',
    padding: 12,
    borderRadius: 24,
  },
  galleryButton: {
    backgroundColor: '#1A2C24',
    padding: 12,
    borderRadius: 24,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1A2C24',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F5E7',
  },
  changePhotoText: {
    color: '#1A2C24',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
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
  icon: {
    width: 24,
    height: 24,
  },
});
