import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { BottomNavbar } from './BottomNavbar';
import { RootStackParamList } from '../../types/navigation';
import { deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'date';
  icon?: string;
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChange }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#666666"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  </View>
);

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', icon }) => {
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
        {icon && <Image source={{ uri: icon }} style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#666666"
        />
      </View>
    </View>
  );
};

export const ProfileInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<null | string>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
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

  const generateUniqueId = () => Date.now().toString() + Math.floor(Math.random() * 1000000).toString();

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


  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      let photoURLToSave = profileImage;

      if (profileImage && profileImage.startsWith('file://')) {
        const url = await uploadImageToFirebase(profileImage);
        if (url) {
          await updateProfile(user, { photoURL: url });
          photoURLToSave = url;
        }
      }

      // S'assurer que la date est au format correct (DD/MM/YYYY)
      let formattedDate = dateNaissance;
      if (dateNaissance && !dateNaissance.includes('/')) {
        try {
          const date = new Date(dateNaissance);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        } catch {
          // En cas d'erreur, garder la valeur originale
          formattedDate = dateNaissance;
        }
      }

      const userRef = doc(db, "users", user.uid);
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
        photoURL: photoURLToSave,
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

      setMessage("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur de mise à jour du profil :", error);
      setMessage("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      setMessage("Erreur de déconnexion.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity
          onPress={async () => {
            const userRef = doc(db, "users", auth.currentUser?.uid || "");
            const snap = await getDoc(userRef);
            const role = snap.data()?.role;
            navigation.navigate(role === "influenceur" ? 'DealsInfluenceur' : 'DealsCommercant');
          }}
        >
          <Image
            source={require('../../assets/ekanwesign.png')}
            style={styles.headerLogo}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
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

          <View style={styles.formContainer}>
            <InputField label="Pseudonyme" value={pseudonyme} onChange={setPseudonyme} />
            <InputField label="Prénom" value={prenom} onChange={setPrenom} />
            <InputField label="Nom" value={nom} onChange={setNom} />
            <InputField label="Date de Naissance" value={dateNaissance} onChange={setDateNaissance} type="date" />
            <InputField label="Téléphone" value={phone} onChange={setPhone} />
            <InputField
              label="Instagram"
              value={instagram}
              onChange={setInstagram}
              icon="https://cdn-icons-png.flaticon.com/512/174/174855.png"
            />
            <InputField
              label="TikTok"
              value={tiktok}
              onChange={setTiktok}
              icon="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
            />
            <InputField label="Lien de Portfolio" value={portfolioLink} onChange={setPortfolioLink} />
            <TextAreaField label="Bio" value={bio} onChange={setBio} />

            {message && (
              <View style={[
                styles.messageContainer,
                message.includes("succès") ? styles.successMessage : styles.errorMessage
              ]}>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sauvegarder</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>

      <BottomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 70,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#F5F5E7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
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
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#1A2C24',
    fontSize: 14,
  },
  inputIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  successMessage: {
    backgroundColor: '#E8F5E9',
  },
  errorMessage: {
    backgroundColor: '#FFEBEE',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: '#1A2C24',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#1A2C24',
    fontSize: 16,
    fontWeight: '600',
  },
  dateInput: {
    height: 44,
    justifyContent: 'center',
  },
  dateText: {
    color: '#000000',
    fontSize: 16,
  },
});