import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BottomNavbar = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('DealsInfluenceur')}
      >
        <Icon name="home" size={24} color="#fff" />
        <Text style={styles.navText}>Accueil</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('SaveDealsInfluenceur')}
      >
        <Icon name="bookmark" size={24} color="#fff" />
        <Text style={styles.navText}>Sauvegardés</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('SuivisDealsInfluenceur')}
      >
        <Icon name="heart" size={24} color="#fff" />
        <Text style={styles.navText}>Suivis</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('DiscussionInfluenceur')}
      >
        <Icon name="message" size={24} color="#fff" />
        <Text style={styles.navText}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('ProfileInfluenceur')}
      >
        <Icon name="account" size={24} color="#fff" />
        <Text style={styles.navText}>Profil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A2C24',
    borderTopWidth: 1,
    borderTopColor: '#2A3C34',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
}); 