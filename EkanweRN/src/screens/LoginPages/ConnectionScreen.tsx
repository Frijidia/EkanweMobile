import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ConnectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/commercant.png')} 
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('WelcomeCommercant')}
          >
            <Text style={styles.buttonText}>COMMERCANT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/influenceur.png')} 
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('WelcomeInfluenceur')}
          >
            <Text style={styles.buttonText}>INFLUENCEUR</Text>
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
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 20,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    maxWidth: 550,
    height: 300,
    borderRadius: 12,
  },
  button: {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    transform: [{ translateX: -88 }, { translateY: 12 }],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 