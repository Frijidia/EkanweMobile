import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function DiscussionPageInfluenceur() {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(doc(db, 'userchats', currentUser.uid), async (snapshot) => {
      const data = snapshot.data();
      if (!data?.chats) {
        setChats([]);
        setLoading(false);
        return;
      }

      const items = data.chats;
      const promises = items.map(async (item) => {
        const userDoc = await getDoc(doc(db, 'users', item.receiverId));
        const user = userDoc.exists() ? userDoc.data() : null;

        const chatDoc = await getDoc(doc(db, 'chats', item.chatId));
        const messages = chatDoc.exists() ? chatDoc.data()?.messages : [];
        const lastMessage = messages?.length > 0 ? messages[messages.length - 1].text : '';

        return { ...item, user, lastMessage };
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  const handleSelect = async (chat) => {
    if (!currentUser) return;
    const userChatsRef = doc(db, 'userchats', currentUser.uid);
    try {
      const updatedChats = chats.map((item) => {
        const { user, ...rest } = item;
        if (item.chatId === chat.chatId) {
          return { ...rest, read: true };
        }
        return rest;
      });
      await updateDoc(userChatsRef, { chats: updatedChats });
      navigation.navigate('Chat', {
        chatId: chat.chatId,
        receiverId: chat.receiverId,
        pseudonyme: chat.user?.pseudonyme,
        photoURL: chat.user?.photoURL,
        role: 'commerçant'
      });
    } catch (error) {
      console.error('Erreur mise à jour du chat :', error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user?.pseudonyme.toLowerCase().includes(input.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F5E7]">
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text className="mt-4 text-[#14210F]">Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F5E7] pb-6">
      <View className="px-4 pt-10 pb-4 bg-[#F5F5E7]">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Discussions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
            <Ionicons name="home" size={24} color="#1A2C24" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 shadow">
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Rechercher une conversation"
            className="flex-1 ml-2 text-sm"
          />
        </View>
      </View>

      <ScrollView className="px-4">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.chatId}
              onPress={() => handleSelect(chat)}
              className="bg-white p-3 rounded-xl shadow mb-3"
            >
              <View className="flex-row items-center">
                <Image
                  source={{ uri: chat.user?.photoURL || 'https://via.placeholder.com/150' }}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text className="font-semibold text-base" numberOfLines={1}>{chat.user?.pseudonyme || 'Utilisateur'}</Text>
                    <Text className="text-xs text-gray-500">{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text className={`text-sm ${chat.read ? 'text-gray-500' : 'text-black font-medium'}`} numberOfLines={1}>
                    {chat.lastMessage || 'Commencez la conversation...'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center mt-20">
            <Text className="text-gray-500">Aucune conversation pour le moment</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
