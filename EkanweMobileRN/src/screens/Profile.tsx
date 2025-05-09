import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const Profile = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    telephone: '+33 6 12 34 56 78',
    bio: 'Influenceuse mode et beauté avec plus de 50K followers sur Instagram.',
    tarifs: 'À partir de 300€ par collaboration',
    disponibilites: 'Disponible en semaine',
  });

  const handleSave = async () => {
    try {
      // La logique de sauvegarde sera gérée par le backend
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    // La logique de déconnexion sera gérée par le backend
    navigation.navigate('Splash');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButton}>{isEditing ? 'Annuler' : 'Modifier'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <Image
            source={require('../assets/profile-placeholder.png')}
            style={styles.profileImage}
          />
          {!isEditing && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>50K</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Campagnes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Note</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Input
            label="Nom"
            value={formData.nom}
            onChangeText={(text) => setFormData({ ...formData, nom: text })}
            editable={isEditing}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Téléphone"
            value={formData.telephone}
            onChangeText={(text) => setFormData({ ...formData, telephone: text })}
            editable={isEditing}
            keyboardType="phone-pad"
          />

          <Input
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            editable={isEditing}
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />

          <Input
            label="Tarifs"
            value={formData.tarifs}
            onChangeText={(text) => setFormData({ ...formData, tarifs: text })}
            editable={isEditing}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Disponibilités"
            value={formData.disponibilites}
            onChangeText={(text) => setFormData({ ...formData, disponibilites: text })}
            editable={isEditing}
            multiline
            numberOfLines={2}
          />
        </View>

        {isEditing ? (
          <Button
            title="ENREGISTRER"
            onPress={handleSave}
            style={styles.saveButton}
          />
        ) : (
          <Button
            title="SE DÉCONNECTER"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    color: 'white',
    fontSize: 24,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginTop: 32,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginTop: 32,
  },
  logoutButtonText: {
    color: '#EF4444',
  },
}); 