import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const Navbar = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('DashboardCommercant')}
      >
        <Icon name="view-dashboard" size={24} color="#fff" />
        <Text style={styles.navText}>Tableau de bord</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('DealsCommercant')}
      >
        <Icon name="briefcase" size={24} color="#fff" />
        <Text style={styles.navText}>Deals</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('DiscussionCommercant')}
      >
        <Icon name="message" size={24} color="#fff" />
        <Text style={styles.navText}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('ProfileCommercant')}
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