import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
//type BottomNavbarRouteProp = RouteProp<RootStackParamList, 'BottomNavbar'>;

export const BottomNavbar = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('DealsInfluenceur')}>
        <Image
          source={require('../../assets/home.png')}
          style={[
            styles.icon,
            styles.homeIcon,
            route.name === 'DealsInfluenceur' && styles.activeIcon
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SuivisDealsInfluenceur')}>
        <Image
          source={require('../../assets/startistique.png')} 
          style={[
            styles.icon,
            route.name === 'SuivisDealsInfluenceur' && styles.activeIcon
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('DiscussionInfluenceur')}>
        <Image
          source={require('../../assets/chat.png')}
          style={[
            styles.icon,
            route.name === 'DiscussionInfluenceur' && styles.activeIcon
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SaveDealsInfluenceur')}>
        <Image
          source={require('../../assets/navigationsave.png')}
          style={[
            styles.icon,
            route.name === 'SaveDealsInfluenceur' && styles.activeIcon
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ProfileInfluenceur')}>
        <Image
          source={require('../../assets/profile.png')}
          style={[
            styles.icon,
            route.name === 'ProfileInfluenceur' && styles.activeIcon
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  homeIcon: {
    width: 48,
    height: 48,
  },
  activeIcon: {
    tintColor: '#F97316', // Orange color for active state
  },
});
