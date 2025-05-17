import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { db, auth } from '../../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';

interface User {
  id: string;
  pseudonyme: string;
  photoURL?: string;
}

export default function AddUser({ onUserAdded }: { onUserAdded: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);

  const handleSearch = async () => {
    if (!searchTerm) return;

    const q = query(
      collection(db, 'users'),
      where('pseudonyme', '>=', searchTerm),
      where('pseudonyme', '<=', searchTerm + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const usersFound: User[] = [];

    querySnapshot.forEach((docSnap) => {
      usersFound.push({ id: docSnap.id, ...docSnap.data() } as User);
    });

    setResults(usersFound);
  };

  const handleAdd = async (userToAdd: User) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const chatRef = doc(collection(db, 'chats'));
      await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const userChatsRef = doc(db, 'userchats', currentUser.uid);
      const receiverChatsRef = doc(db, 'userchats', userToAdd.id);

      const userChatsSnap = await getDoc(userChatsRef);
      if (!userChatsSnap.exists()) {
        await setDoc(userChatsRef, { chats: [] });
      }

      const receiverChatsSnap = await getDoc(receiverChatsRef);
      if (!receiverChatsSnap.exists()) {
        await setDoc(receiverChatsRef, { chats: [] });
      }

      await updateDoc(userChatsRef, {
        chats: arrayUnion({
          chatId: chatRef.id,
          lastMessage: '',
          receiverId: userToAdd.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(receiverChatsRef, {
        chats: arrayUnion({
          chatId: chatRef.id,
          lastMessage: '',
          receiverId: currentUser.uid,
          updatedAt: Date.now(),
        }),
      });

      onUserAdded();
    } catch (error) {
      console.error('Erreur lors de la création du chat :', error);
    }
  };

  return (
    <View className="mt-4 px-4">
      <View className="flex-row mb-4 space-x-2">
        <TextInput
          placeholder="Rechercher un utilisateur"
          value={searchTerm}
          onChangeText={setSearchTerm}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
        />
        <TouchableOpacity
          onPress={handleSearch}
          className="bg-[#FF6B2E] px-4 rounded-lg justify-center"
        >
          <Text className="text-white font-medium">Chercher</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center bg-white p-3 mb-2 rounded-lg border">
            <View className="flex-row items-center space-x-3">
              <Image
                source={{ uri: item.photoURL || 'https://via.placeholder.com/150' }}
                className="w-10 h-10 rounded-full"
              />
              <Text className="text-[#1A2C24] font-medium">{item.pseudonyme}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleAdd(item)}
              className="bg-[#1A2C24] px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-sm">Ajouter</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
