import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavbar } from './BottomNavbar';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  text: string;
  createdAt: Date;
}

interface ChatItem {
  chatId: string;
  lastMessage: string;
  receiverId: string;
  updatedAt: number;
  read: boolean;
  messages?: Message[];
  user?: {
    pseudonyme: string;
    photoURL?: string;
  } | null;
}

export const DiscussionInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "userchats", user.uid), async (snapshot) => {
      try {
        const data = snapshot.data();
        if (!data?.chats) {
          setChats([]);
          return;
        }

        const items = data.chats as ChatItem[];

        const promises = items.map(async (item) => {
          // Get user info
          const userDoc = await getDoc(doc(db, "users", item.receiverId));
          let user = null;
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (typeof data.pseudonyme === "string") {
              user = {
                pseudonyme: data.pseudonyme,
                photoURL: data.photoURL || undefined,
              };
            }
          }

          // Get chat messages
          const chatDoc = await getDoc(doc(db, "chats", item.chatId));
          const messages = chatDoc.exists() ? chatDoc.data()?.messages || [] : [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1].text : "";

          return { 
            ...item, 
            user,
            lastMessage
          };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error("Erreur lors du chargement des chats:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleSelect = async (chat: ChatItem) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userChatsRef = doc(db, "userchats", user.uid);
      const updatedChats = chats.map((item) => {
        const { user, ...rest } = item;
        return item.chatId === chat.chatId ? { ...rest, read: true } : rest;
      });

      await updateDoc(userChatsRef, { chats: updatedChats });

      navigation.navigate('Chat', {
        chatId: chat.chatId,
        pseudonyme: chat.user?.pseudonyme,
        photoURL: chat.user?.photoURL,
        role: "influenceur"
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du chat :", err);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user?.pseudonyme.toLowerCase().includes(input.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text style={styles.loadingText}>Chargement des conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discussions</Text>
        <Image
          source={require('../../assets/ekanwesign.png')}
          style={styles.headerLogo}
        />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Image
            source={require('../../assets/loupe.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={input}
            onChangeText={setInput}
            placeholder="Rechercher une conversation"
            placeholderTextColor="#666666"
          />
          <Image
            source={require('../../assets/menu.png')}
            style={styles.menuIcon}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddMode(!addMode)}
        >
          <Text style={styles.addButtonText}>
            {addMode ? "Annuler" : "Ajouter"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatList}>
        {addMode ? (
          <View style={styles.addUserContainer}>
            {/* AddUser component will be implemented separately */}
            <Text style={styles.addUserText}>Composant AddUser à implémenter</Text>
          </View>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.chatId}
              style={styles.chatItem}
              onPress={() => handleSelect(chat)}
            >
              <View style={styles.chatContent}>
                <Image
                  source={chat.user?.photoURL ? { uri: chat.user.photoURL } : require('../../assets/profile.png')}
                  style={styles.avatar}
                />
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>
                      {chat.user?.pseudonyme || "Utilisateur"}
                    </Text>
                    <Text style={styles.chatTime}>
                      {new Date(chat.updatedAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View style={styles.chatFooter}>
                    <Text
                      style={[
                        styles.chatMessage,
                        chat.read ? styles.readMessage : styles.unreadMessage
                      ]}
                      numberOfLines={1}
                    >
                      {chat.lastMessage || "Commencez la conversation..."}
                    </Text>
                    {!chat.read && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>1</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune conversation</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingText: {
    marginTop: 16,
    color: '#14210F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#14210F',
    fontSize: 14,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#14210F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  chatList: {
    flex: 1,
    padding: 16,
  },
  addUserContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  addUserText: {
    color: '#666666',
    textAlign: 'center',
  },
  chatItem: {
    backgroundColor: '#F5F5E7',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chatContent: {
    flexDirection: 'row',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14210F',
  },
  chatTime: {
    fontSize: 12,
    color: '#666666',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  readMessage: {
    color: '#666666',
  },
  unreadMessage: {
    color: '#000000',
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#FF0000',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 80,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
}); 