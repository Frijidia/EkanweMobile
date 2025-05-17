import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useUserData } from '../../context/UserContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export const ConnectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {setRole} = useUserData();

  const handleCommercant = () => {
    setRole('commerçant');
    navigation.navigate('WelcomeCommercant');
  };

  const handleInfluenceur = () => {
    setRole('influenceur');
    navigation.navigate('WelcomeInfluenceur');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/commercant.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.button} onPress={handleCommercant}>
          <Text style={styles.buttonText}>COMMERCANT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/influenceur.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.button} onPress={handleInfluenceur}>
          <Text style={styles.buttonText}>INFLUENCEUR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2C24',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 30,
    width: width * 0.8,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 16,
  },
  button: {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.3 }],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    //backdropFilter: 'blur(10px)',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
