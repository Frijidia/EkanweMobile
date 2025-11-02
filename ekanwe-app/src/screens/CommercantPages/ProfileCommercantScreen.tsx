import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
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

  const uploadImageToFirebase = async (uri: string): Promise<string | null> => {
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

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      let photoURLToSave = profileImage;

      if (profileImage && profileImage.startsWith('file://')) {
        const url = await uploadImageToFirebase(profileImage);
        if (url) photoURLToSave = url;
      }

      // Format date
      let formattedDate = dateNaissance;
      if (dateNaissance && !dateNaissance.includes('/')) {
        try {
          const date = new Date(dateNaissance);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
          }
        } catch {
          formattedDate = dateNaissance;
        }
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        pseudonyme,
        prenom,
        nom,
        phone,
        dateNaissance: formattedDate || '',
        instagram,
        tiktok,
        portfolioLink,
        bio,
        photoURL: photoURLToSave || '',
      });

      // Récupérer les données mises à jour immédiatement
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        const data = updatedSnap.data();
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
    }
  };

  const handleImageClick = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;

      const downloadURL = await uploadImageToFirebase(uri);
      if (downloadURL) {
        setProfileImage(downloadURL);
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { photoURL: downloadURL });
        }
      }
    }
  };

  const handleGalleryClick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;

      const downloadURL = await uploadImageToFirebase(uri);
      if (downloadURL) {
        setProfileImage(downloadURL);
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { photoURL: downloadURL });
        }
      }
    }
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
        <InputField label="Pseudonyme" value={pseudonyme} onChange={setPseudonyme} />
        <InputField label="Prénom" value={prenom} onChange={setPrenom} />
        <InputField label="Nom" value={nom} onChange={setNom} />
        <InputField label="Date de Naissance" value={dateNaissance} onChange={setDateNaissance} type="date" />
        <InputField label="Téléphone" value={phone} onChange={setPhone} />
        <InputField label="Instagram" value={instagram} onChange={setInstagram} />
        <InputField label="TikTok" value={tiktok} onChange={setTiktok} />
        <InputField label="Lien de Portfolio" value={portfolioLink} onChange={setPortfolioLink} />
        <InputField label="Bio" value={bio} onChange={setBio} multiline />
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

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'date';
  icon?: string;
  multiline?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', icon, multiline = false }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(() => {
    if (!value) return new Date();
    try {
      // Si la date est au format français (DD/MM/YYYY)
      if (value.includes('/')) {
        const [day, month, year] = value.split('/').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (isNaN(parsedDate.getTime())) {
          return new Date();
        }
        return parsedDate;
      }
      // Si la date est au format ISO ou autre
      const parsedDate = new Date(value);
      if (isNaN(parsedDate.getTime())) {
        return new Date();
      }
      return parsedDate;
    } catch {
      return new Date();
    }
  });

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      onChange(formattedDate);
    }
  };

  if (type === 'date') {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.inputWrapper, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
        >
          {icon && <Image source={{ uri: icon }} style={styles.inputIcon} />}
          <Text style={styles.dateText}>
            {value || date.toLocaleDateString('fr-FR')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && (
          <Image
            source={{ uri: icon }}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#666666"
          multiline={multiline}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5E7',
    minHeight: '100%',
    paddingTop: 40,
    paddingBottom: 70,
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
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#14210F',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 12,
    color: '#000000',
    fontSize: 16,
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
  dateInput: {
    height: 44,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
  },
  dateText: {
    color: '#000000',
    fontSize: 16,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
