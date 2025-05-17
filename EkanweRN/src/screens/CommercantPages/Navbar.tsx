import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import home from '../../assets/home.png';
import startistique from '../../assets/startistique.png';
import dashboard from '../../assets/dashboard.png';
import profile from '../../assets/profile.png';
import chat from '../../assets/chat.png';

export default function Navbar() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;

  const iconStyle = (targetRoute: string) => ({
    tintColor: currentRoute === targetRoute ? '#FF6B2E' : undefined,
  });

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center bg-gray-500 py-3 px-4">
      <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
        <Image source={home} style={[{ width: 32, height: 32 }, iconStyle('DealsCommercant')]} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SuiviDealsCommercant')}>
        <Image source={startistique} style={[{ width: 24, height: 24 }, iconStyle('SuiviDealsCommercant')]} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <Image source={dashboard} style={[{ width: 24, height: 24 }, iconStyle('Dashboard')]} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('DiscussionCommercant')}>
        <Image source={chat} style={[{ width: 24, height: 24 }, iconStyle('DiscussionCommercant')]} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ProfileCommercant')}>
        <Image source={profile} style={[{ width: 24, height: 24 }, iconStyle('ProfileCommercant')]} />
      </TouchableOpacity>
    </View>
  );
}
