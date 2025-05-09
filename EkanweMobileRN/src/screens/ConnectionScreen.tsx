import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useUserData } from '../context/UserContext';

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
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/commercant.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={onCommercantClick}
        >
          <Text style={styles.buttonText}>COMMERCANT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/influenceur.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={onInfluenceurClick}
        >
          <Text style={styles.buttonText}>INFLUENCEUR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  image: {
    width: width * 0.8,
    maxWidth: 400,
    height: 200,
    borderRadius: 12,
  },
  button: {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: 20 }],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 44,
    paddingVertical: 8,
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
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 