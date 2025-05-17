import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
//import Logo from '../../components/Logo'; // Remplace si nécessaire

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PortfolioStep'>;

export const PortfolioStepScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [portfolioLink, setPortfolioLink] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPortfolioLink(data.portfolioLink || '');
      }
    };

    fetchPortfolio();
  }, []);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('Erreur', 'Utilisateur non connecté');

    try {
      await updateDoc(doc(db, "users", user.uid), {
        portfolioLink: portfolioLink.trim(),
        inscription: 'Terminé'
      });

      navigation.replace('RegistrationComplete');
    } catch (error) {
      console.error('Erreur enregistrement portfolio:', error);
      Alert.alert('Erreur', 'Une erreur est survenue pendant la soumission.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.box}>
          <Text style={styles.stepText}>4/4</Text>
          {/*<Logo style={styles.logo} />*/}

          <Text style={styles.subtitle}>Inscription</Text>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.description}>
            Pour valider ton profil de créateur de contenu, tu dois nous envoyer quelques exemples de tes réalisations.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Colle un lien vers ton portfolio"
            placeholderTextColor="#cccccc"
            value={portfolioLink}
            onChangeText={setPortfolioLink}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>RETOUR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>SUIVANT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2C24',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  box: {
    width: '100%',
    backgroundColor: '#1A2C24',
    borderColor: '#AEC9B6',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
  },
  stepText: {
    color: '#ffffff',
    textAlign: 'right',
    fontSize: 12,
    marginBottom: 8,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    color: '#9CA3AF',
    letterSpacing: 2,
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ccc',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
