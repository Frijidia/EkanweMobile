import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

type PortfolioStepScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PortfolioStep'>;

export const PortfolioStep = () => {
  const navigation = useNavigation<PortfolioStepScreenNavigationProp>();
  const [formData, setFormData] = useState({
    bio: '',
    tarifs: '',
    disponibilites: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddPhoto = () => {
    // La logique de sélection de photos sera gérée par le backend
    console.log('Ajouter une photo');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // La logique de sauvegarde du portfolio sera gérée par le backend
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Créez votre portfolio</Text>
          <Text style={styles.subtitle}>
            Ajoutez des photos et des informations pour présenter votre travail
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Parlez-nous de vous"
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />

          <Input
            label="Tarifs"
            value={formData.tarifs}
            onChangeText={(text) => setFormData({ ...formData, tarifs: text })}
            placeholder="Indiquez vos tarifs"
            multiline
            numberOfLines={2}
          />

          <Input
            label="Disponibilités"
            value={formData.disponibilites}
            onChangeText={(text) => setFormData({ ...formData, disponibilites: text })}
            placeholder="Précisez vos disponibilités"
            multiline
            numberOfLines={2}
          />

          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.photo} />
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Text style={styles.addPhotoText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="RETOUR"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textStyle={styles.backButtonText}
          />
          <Button
            title={loading ? "Création..." : "TERMINER"}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
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
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  photosSection: {
    gap: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    color: '#4B5563',
    fontSize: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
  },
  backButtonText: {
    color: 'white',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#007AFF',
  },
}); 