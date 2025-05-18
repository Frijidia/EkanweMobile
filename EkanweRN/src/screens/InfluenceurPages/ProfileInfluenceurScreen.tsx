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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BottomNavbar } from './BottomNavbar';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'date';
  icon?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', icon }) => (
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
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#666666"
        keyboardType={type === 'date' ? 'numeric' : 'default'}
      />
    </View>
  </View>
);

const TextAreaField: React.FC<InputFieldProps> = ({ label, value, onChange }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      value={value}
      onChangeText={onChange}
      multiline
      numberOfLines={3}
      placeholderTextColor="#666666"
    />
  </View>
);

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
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
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
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      setMessage("Erreur lors de la sélection de l'image");
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, "users", user.uid), {
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
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={handleGalleryClick}
            >
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
              <View style={styles.imageOverlay}>
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
            </TouchableOpacity>
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
    paddingBottom: 20,
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
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
  },
  cameraButton: {
    backgroundColor: '#FF6B2E',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  galleryButton: {
    backgroundColor: '#1A2C24',
    padding: 8,
    borderRadius: 20,
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
}); 