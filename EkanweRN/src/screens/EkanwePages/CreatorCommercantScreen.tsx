import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export const CreatorCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/feminine_caracter.png')}
        style={styles.character}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.title}>Boostez votre visibilité</Text>
        <Text style={styles.description}>
          Gagne en visibilité grâce aux créateurs de contenu de ta ville, sans sortir un franc. Juste un bon deal.
        </Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressDot, { backgroundColor: '#6B7280' }]} />
          <View style={[styles.progressDot, { backgroundColor: 'white' }]} />
          <View style={[styles.progressDot, { backgroundColor: '#6B7280' }]} />
        </View>

        <View style={styles.footer}>
          <Image
            source={require('../../assets/ekanwe-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('ConceptCommercant')}
          >
            <Text style={styles.nextArrow}>→</Text>
          </TouchableOpacity>
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
    paddingBottom: 24,
  },
  character: {
    position: 'absolute',
    width: 160,
    height: 160,
    bottom: 280,
    left: 30,
    transform: [{ scaleX: -1 }],
    zIndex: 0,
  },
  card: {
    width: width * 0.95,
    backgroundColor: '#1A2C24',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#aec9b6',
    padding: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: 'white',
    marginBottom: 36,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  progressDot: {
    flex: 1,
    height: 4,
    marginHorizontal: 4,
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 40,
  },
  nextButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextArrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
