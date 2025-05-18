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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "userchats", user.uid), async (snapshot) => {
      try {
        setLoading(true);
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
        console.error('Error fetching chats:', error);
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

      navigation.navigate('ChatInfluenceur', {
        chatId: chat.chatId,
        pseudonyme: chat.user?.pseudonyme,
        photoURL: chat.user?.photoURL,
        role: 'influenceur'
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du chat :", err);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user?.pseudonyme.toLowerCase().includes(searchQuery.toLowerCase())
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
        <TouchableOpacity onPress={() => navigation.navigate('NotificationInfluenceur')}>
            <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('DealsInfluenceur')}>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
          </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#1A2C24" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une conversation"
            placeholderTextColor="#1A2C24"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="menu" size={20} color="#1A2C24" style={styles.menuIcon} />
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

      <ScrollView style={styles.content}>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.chatId}
              style={styles.chatCard}
              onPress={() => handleSelect(chat)}
            >
              <Image
                source={chat.user?.photoURL ? { uri: chat.user.photoURL } : require('../../assets/profile.png')}
                style={styles.userImage}
              />
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.userName}>{chat.user?.pseudonyme || "Utilisateur"}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(chat.updatedAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <View style={styles.messageContainer}>
                  <Text
                    style={[
                      styles.lastMessage,
                      !chat.read && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage || "Commencez la conversation..."}
                  </Text>
                  {!chat.read && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>1</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune conversation</Text>
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1A2C24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1A2C24',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#1A2C24',
  },
  menuIcon: {
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#1A2C24',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5E7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
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
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2C24',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  unreadMessage: {
    color: '#1A2C24',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF6B2E',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    marginTop: 80,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
  },
}); 