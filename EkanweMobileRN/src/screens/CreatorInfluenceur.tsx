import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

type CreatorInfluenceurScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatorInfluenceur'>;

export const CreatorInfluenceur = () => {
  const navigation = useNavigation<CreatorInfluenceurScreenNavigationProp>();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // La logique de création de profil sera gérée par le backend
      navigation.navigate('InterestStep');
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
          <Text style={styles.title}>Créer votre profil</Text>
          <Text style={styles.subtitle}>
            Remplissez les informations ci-dessous pour créer votre profil d'influenceur
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nom"
            value={formData.nom}
            onChangeText={(text) => setFormData({ ...formData, nom: text })}
            placeholder="Entrez votre nom"
          />

          <Input
            label="Prénom"
            value={formData.prenom}
            onChangeText={(text) => setFormData({ ...formData, prenom: text })}
            placeholder="Entrez votre prénom"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Entrez votre email"
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
            label="Date de naissance"
            value={formData.dateNaissance}
            onChangeText={(text) => setFormData({ ...formData, dateNaissance: text })}
            placeholder="JJ/MM/AAAA"
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