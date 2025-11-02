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
import storage from '@react-native-firebase/storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { db, auth } from '../firebase/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sendNotification, sendNotificationToToken } from '../hooks/sendNotifications';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

  const uploadImageToFirebase = async (uri: string): Promise<string | null> => {
    try {
      const storageInstance = getStorage();
      const filename = `${auth.currentUser?.uid}_${Date.now()}.jpg`;
      const reference = ref(storageInstance, `profileImages/${filename}`);

      // ✅ Convertir file:// en blob avec fetch (nouvelle méthode Expo)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload
      await uploadBytes(reference, blob);

      // URL publique
      const url = await getDownloadURL(reference);
      return url;
    } catch (error) {
      console.error("❌ Erreur upload Firebase Storage:", error);
      return null;
    }
  };

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
            img: msg.img || null,
          }))
        )
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

    const senderId = auth.currentUser.uid;
    const chatRef = doc(db, 'chats', chatId);

    let uploadedImageUrl: string | null = null;
    if (imagePreview && imagePreview.startsWith('file://')) {
      uploadedImageUrl = await uploadImageToFirebase(imagePreview);
    }

    const newMsg = {
      senderId,
      text: newMessage,
      createdAt: new Date(),
      ...(uploadedImageUrl && { img: uploadedImageUrl }),
    };

    try {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMsg),
      });
    } catch (err) {
      console.error('Erreur lors de l’envoi du message :', err);
    }

    setNewMessage('');
    setImagePreview(null);
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la galerie.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;

      // ✅ On envoie directement au Storage
      const downloadURL = await uploadImageToFirebase(uri);

      if (downloadURL) {
        // ✅ Mettre l’URL Firebase dans ton state
        setImagePreview(downloadURL);
      }
    }
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
        <TouchableOpacity onPress={handleImagePick} disabled={!!imagePreview} style={styles.attachButton}>
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
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 5,
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