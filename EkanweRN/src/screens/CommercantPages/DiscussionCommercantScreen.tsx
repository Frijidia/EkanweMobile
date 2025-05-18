import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { Ionicons } from '@expo/vector-icons';

export const DiscussionCommercantScreen = () => {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Discussions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
            <Ionicons name="home" size={24} color="#1A2C24" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Rechercher une conversation"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.chatList}>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.chatId}
              onPress={() => handleSelect(chat)}
              style={styles.chatItem}
            >
              <View style={styles.chatContent}>
                <Image
                  source={{ uri: chat.user?.photoURL || 'https://via.placeholder.com/150' }}
                  style={styles.avatar}
                />
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.username} numberOfLines={1}>{chat.user?.pseudonyme || 'Utilisateur'}</Text>
                    <Text style={styles.time}>{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={[styles.lastMessage, !chat.read && styles.unreadMessage]} numberOfLines={1}>
                    {chat.lastMessage || 'Commencez la conversation...'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune conversation pour le moment</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    paddingTop: 40,
    paddingBottom: 6
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7'
  },
  loadingText: {
    marginTop: 4,
    color: '#14210F'
  },
  header: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#F5F5E7'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14
  },
  chatList: {
    padding: 16
  },
  chatItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12
  },
  chatInfo: {
    flex: 1
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  username: {
    fontWeight: '600',
    fontSize: 16
  },
  time: {
    fontSize: 12,
    color: '#666'
  },
  lastMessage: {
    fontSize: 14,
    color: '#666'
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500'
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80
  },
  emptyText: {
    color: '#666'
  }
});
