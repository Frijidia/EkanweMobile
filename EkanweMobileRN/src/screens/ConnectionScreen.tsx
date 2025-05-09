import React from 'react';
import { View, StyleSheet, Image, Dimensions, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useUserData } from '../context/UserContext';
import { Button } from '../components/Button';

type ConnectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Connection'>;

const { width } = Dimensions.get('window');

export const ConnectionScreen = () => {
  const navigation = useNavigation<ConnectionScreenNavigationProp>();
  const { setRole } = useUserData();

  const onInfluenceurClick = () => {
    setRole('influenceur');
    navigation.navigate('WelcomeInfluenceur');
  };

  const onCommercantClick = () => {
    setRole('commerçant');
    navigation.navigate('WelcomeCommercant');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/ekanwe-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Choisissez votre profil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Image
            source={require('../assets/commercant.png')}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Commerçant</Text>
            <Text style={styles.cardDescription}>
              Gérez vos campagnes et trouvez des influenceurs pour promouvoir vos produits
            </Text>
            <Button
              title="CONTINUER"
              onPress={onCommercantClick}
              style={styles.button}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Image
            source={require('../assets/influenceur.png')}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Influenceur</Text>
            <Text style={styles.cardDescription}>
              Créez du contenu et collaborez avec des marques pour monétiser votre influence
            </Text>
            <Button
              title="CONTINUER"
              onPress={onInfluenceurClick}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
  },
}); 