import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import Navbar from '../../components/Navbar';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationPageCommercant() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const notifRef = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notifRef, (snapshot) => {
      const notifList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifList);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notif) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notifDocRef = doc(db, 'users', user.uid, 'notifications', notif.id);
      await updateDoc(notifDocRef, { read: true });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );

      if (notif.targetRoute) {
        navigation.navigate(notif.targetRoute);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification :', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) =>
    n.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView className="bg-[#F5F5E7] min-h-screen pt-5 px-4">
      <View className="flex-row justify-between items-center mb-5">
        <View className="relative">
          <Text className="text-3xl font-bold text-[#1A2C24]">Notifications</Text>
          {unreadCount > 0 && (
            <View className="absolute -top-2 -right-4 bg-red-500 rounded-full px-2">
              <Text className="text-white text-xs">{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
          <Ionicons name="home-outline" size={24} color="#1A2C24" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center bg-white/10 border border-black rounded-lg px-3 py-2 mb-4">
        <Ionicons name="search" size={20} color="black" className="mr-2" />
        <TextInput
          placeholder="Recherche"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-sm"
        />
      </View>

      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            onPress={() => handleNotificationClick(notif)}
            className={`p-4 rounded-lg shadow-lg mb-4 ${notif.read ? 'bg-white' : 'bg-orange-100'}`}
          >
            <Text className="text-sm font-semibold text-[#1A2C24]">{notif.message}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <View className="mt-20 p-4 rounded-lg shadow-lg bg-[#F5F5E7]">
          <Text className="text-sm text-center text-gray-600">Aucune notification pour l'instant</Text>
        </View>
      )}

      <View className="my-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-full border border-black py-3 rounded-lg text-center"
        >
          <Text className="text-base text-[#1A2C24]">Retour</Text>
        </TouchableOpacity>
      </View>

      <Navbar />
    </ScrollView>
  );
}
