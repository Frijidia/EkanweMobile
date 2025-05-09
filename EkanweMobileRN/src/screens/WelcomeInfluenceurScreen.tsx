import React from 'react';
import { View, StyleSheet, Image, Dimensions, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components/Button';

type WelcomeInfluenceurScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WelcomeInfluenceur'>;

const { width } = Dimensions.get('window');

export const WelcomeInfluenceurScreen = () => {
  const navigation = useNavigation<WelcomeInfluenceurScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/character.png')}
        style={styles.character}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.title}>Bienvenue !</Text>
        <Text style={styles.description}>
          EKANWE, c'est le pouvoir du bouche-à-oreille numérique, au service des commerces de chez nous.
        </Text>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarInactive]} />
          <View style={[styles.progressBar, styles.progressBarInactive]} />
        </View>

        <View style={styles.footer}>
          <Image
            source={require('../assets/ekanwe-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Button
            title="→"
            onPress={() => navigation.navigate('CreatorInfluenceur')}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
  },
  character: {
    width: 160,
    height: 160,
    position: 'absolute',
    bottom: 290,
    right: 30,
    zIndex: 0,
  },
  card: {
    width: width * 0.95,
    backgroundColor: '#1A2C24',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#aec9b6',
    padding: 32,
    paddingBottom: 32,
    zIndex: 10,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 36,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 44,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 36,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: 'white',
  },
  progressBarInactive: {
    backgroundColor: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 96,
    height: 96,
  },
  nextButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 0,
    minWidth: 40,
  },
  nextButtonText: {
    fontSize: 20,
  },
}); 