import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

type CreatorCommercantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatorCommercant'>;

export const CreatorCommercant = () => {
  const navigation = useNavigation<CreatorCommercantScreenNavigationProp>();
  const [formData, setFormData] = useState({
    nomEntreprise: '',
    email: '',
    telephone: '',
    adresse: '',
    description: '',
    siteWeb: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // La logique de création de profil sera gérée par le backend
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
          <Image
            source={require('../assets/ekanwe-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Créer votre profil commerçant</Text>
          <Text style={styles.subtitle}>
            Remplissez les informations ci-dessous pour créer votre profil d'entreprise
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nom de l'entreprise"
            value={formData.nomEntreprise}
            onChangeText={(text) => setFormData({ ...formData, nomEntreprise: text })}
            placeholder="Entrez le nom de votre entreprise"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Entrez votre email professionnel"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Téléphone"
            value={formData.telephone}
            onChangeText={(text) => setFormData({ ...formData, telephone: text })}
            placeholder="Entrez votre numéro de téléphone"
            keyboardType="phone-pad"
          />

          <Input
            label="Adresse"
            value={formData.adresse}
            onChangeText={(text) => setFormData({ ...formData, adresse: text })}
            placeholder="Entrez l'adresse de votre entreprise"
            multiline
            numberOfLines={2}
          />

          <Input
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Décrivez votre entreprise"
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
          />

          <Input
            label="Site web"
            value={formData.siteWeb}
            onChangeText={(text) => setFormData({ ...formData, siteWeb: text })}
            placeholder="Entrez l'URL de votre site web"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.footer}>
          <Button
            title="RETOUR"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textStyle={styles.backButtonText}
          />
          <Button
            title={loading ? "Création..." : "CONTINUER"}
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
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
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
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
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