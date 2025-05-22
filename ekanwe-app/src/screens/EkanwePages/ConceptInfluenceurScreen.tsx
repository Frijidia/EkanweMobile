import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ConceptInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/character.png')} 
        style={styles.character}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.title}>Concept</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Pas d'argent</Text>
          <Text style={styles.listItem}>• Pas de barrière</Text>
          <Text style={styles.listItem}>• Juste des collaborations gagnant-gagnant</Text>
        </View>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot,  styles.activeDot]} />
        </View>

        <View style={styles.footer}>
          <Image 
            source={require('../../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => navigation.navigate('LoginOrConnect')}
          >
            <Text style={styles.nextButtonText}>→</Text>
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
  },
  character: {
    width: 160,
    height: 300,
    position: 'absolute',
    bottom: 300,
    right: 30,
    zIndex: 0,
  },
  card: {
    width: '95%',
    backgroundColor: '#1A2C24',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#aec9b6',
    padding: 32,
    paddingBottom: 32,
    marginBottom: 32,
    zIndex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 36,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 44,
  },
  list: {
    marginBottom: 32,
  },
  listItem: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 36,
  },
  dot: {
    flex: 1,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: '#fff',
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
    backgroundColor: '#FF6B2E',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
  },
}); 