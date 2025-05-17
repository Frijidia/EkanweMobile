import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

// Fonction pour prendre une photo
export const takePicture = async () => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de caméra refusée');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la prise de photo:', error);
    throw error;
  }
};

// Fonction pour sélectionner une image depuis la galerie
export const pickImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de galerie refusée');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la sélection de l\'image:', error);
    throw error;
  }
};

// Fonction pour obtenir la position actuelle
export const getCurrentPosition = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la position:', error);
    throw error;
  }
};

// Fonction pour configurer la barre de statut
export const configureStatusBar = () => {
  StatusBar.setStatusBarStyle('dark');
  StatusBar.setStatusBarBackgroundColor('#FF6B2E');
}; 