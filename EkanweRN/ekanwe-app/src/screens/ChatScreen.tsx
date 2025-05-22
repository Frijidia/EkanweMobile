import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { db, auth } from '../firebase/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sendNotification } from '../hooks/sendNotifications';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatInfluenceur'>;

interface ChatParams {
  chatId: string;
  pseudonyme: string;
  photoURL: string;
  role: 'influenceur' | 'commerçant';
  receiverId: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  img?: string;
}

const MAX_BASE64_SIZE = 1370000;

export const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const params = route.params as ChatParams;
  const { chatId, pseudonyme, photoURL, role, receiverId } = params;

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!chatId) return;

    const chatRef = doc(db, 'chats', chatId);
    const unsub = onSnapshot(chatRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.messages) {
        setMessages(
          data.messages.map((msg: any) => ({
            ...msg,
            createdAt: msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(),
          }))
        );
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && !imagePreview) return;
    if (!chatId || !auth.currentUser) return;

    const chatRef = doc(db, 'chats', chatId);
    const senderId = auth.currentUser.uid;

    const newMsg = {
      senderId,
      text: newMessage,
      createdAt: new Date(),
      ...(imagePreview && { img: imagePreview }),
    };

    try {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMsg),
      });

      const userChatsRefSender = doc(db, 'userchats', senderId);
      const userChatsRefReceiver = doc(db, 'userchats', receiverId);

      const senderChatsSnap = await getDoc(userChatsRefSender);
      const receiverChatsSnap = await getDoc(userChatsRefReceiver);

      if (senderChatsSnap.exists() && receiverChatsSnap.exists()) {
        const senderChats = senderChatsSnap.data().chats;
        const receiverChats = receiverChatsSnap.data().chats;

        const updateChatsList = (chatsList: any[]) => {
          const index = chatsList.findIndex((c) => c.chatId === chatId);
          if (index !== -1) {
            chatsList[index].lastMessage = newMessage;
            chatsList[index].updatedAt = Date.now();
            chatsList[index].isSeen = true;
          }
          return chatsList;
        };

        await updateDoc(userChatsRefSender, {
          chats: updateChatsList(senderChats),
        });

        await updateDoc(userChatsRefReceiver, {
          chats: updateChatsList(receiverChats),
        });
      }

      await sendNotification({
        toUserId: receiverId,
        fromUserId: senderId,
        message: 'Vous avez un nouveau message.',
        relatedDealId: '',
        targetRoute: `/chat/${chatId}`,
        type: 'new_message',
      });
    } catch (err) {
      console.error('Erreur d\'envoi de message:', err);
    }

    setNewMessage('');
    setImagePreview(null);
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Tu dois autoriser l'accès à la galerie.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });
    if (result.canceled) {
      Alert.alert("Aucune image sélectionnée");
      return null;
    }
    const base64Image = result.assets[0].base64;
    if (base64Image!.length > MAX_BASE64_SIZE) {
      Alert.alert(
        "Image trop lourde",
        "L'image dépasse la taille maximale autorisée (1 Mo). Essaie une image plus légère ou compresse-la."
      );
      setImagePreview(null);
    }
    setImagePreview(base64Image!);
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.senderId === auth.currentUser?.uid;

    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {message.img && (
          <Image
            source={{ uri: message.img }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
          ]}
        >
          {formatDistanceToNow(message.createdAt, { addSuffix: true, locale: fr })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A2C24" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#14210F" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image
            source={photoURL ? { uri: photoURL } : require('../assets/profile.png')}
            style={styles.avatar}
          />
          <Text style={styles.headerTitle}>{pseudonyme || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate(role === 'influenceur' ? 'DealsInfluenceur' : 'DealsCommercant')}
          style={styles.logoButton}
        >
          <Image
            source={require('../assets/ekanwesign.png')}
            style={styles.logo}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Image Preview */}
      {imagePreview && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
          <TouchableOpacity
            onPress={() => setImagePreview(null)}
            style={styles.cancelImageButton}
          >
            <Icon name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleImagePick} style={styles.attachButton}>
          <Icon name="paperclip" size={24} color="#14210F" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrivez votre message..."
          placeholderTextColor="#666666"
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            (!newMessage.trim() && !imagePreview) && styles.sendButtonDisabled,
          ]}
          disabled={!newMessage.trim() && !imagePreview}
        >
          <Icon name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14210F',
  },
  logoButton: {
    padding: 8,
  },
  logo: {
    width: 24,
    height: 24,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '75%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#1A2C24',
    borderBottomRightRadius: 4,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#14210F',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#CCCCCC',
  },
  otherMessageTime: {
    color: '#666666',
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imagePreviewContainer: {
    padding: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  cancelImageButton: {
    position: 'absolute',
    top: 8,
    left: 24,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 14,
    color: '#14210F',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1A2C24',
    padding: 8,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
}); 