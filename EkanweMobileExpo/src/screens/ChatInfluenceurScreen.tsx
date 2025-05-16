import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatRouteProp = RouteProp<RootStackParamList, 'ChatInfluenceur'>;

export const ChatInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatRouteProp>();
  const [message, setMessage] = useState('');

  // Simuler les données de la conversation
  const conversation = {
    id: route.params.conversationId,
    merchant: {
      name: 'Le Petit Bistrot',
      image: require('../assets/merchant1.png'),
    },
    messages: [
      {
        id: '1',
        text: 'Bonjour, nous sommes intéressés par votre profil pour notre nouvelle promotion.',
        timestamp: '10:30',
        isMerchant: true,
      },
      {
        id: '2',
        text: 'Bonjour ! Je suis très intéressé par votre offre.',
        timestamp: '10:32',
        isMerchant: false,
      },
      {
        id: '3',
        text: 'Parfait ! Pouvez-vous nous en dire plus sur votre expérience ?',
        timestamp: '10:33',
        isMerchant: true,
      },
    ],
  };

  const sendMessage = () => {
    if (message.trim()) {
      // TODO: Implémenter l'envoi de message
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Image source={conversation.merchant.image} style={styles.merchantImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.merchantName}>{conversation.merchant.name}</Text>
          <Text style={styles.status}>En ligne</Text>
        </View>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {conversation.messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageContainer,
              msg.isMerchant ? styles.merchantMessage : styles.userMessage,
            ]}
          >
            {msg.isMerchant && (
              <Image source={conversation.merchant.image} style={styles.messageAvatar} />
            )}
            <View style={styles.messageContent}>
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.messageTimestamp}>{msg.timestamp}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez votre message..."
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Icon name="send" size={24} color="#FF6B2E" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3C34',
  },
  backButton: {
    marginRight: 16,
  },
  merchantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  merchantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    color: '#4CAF50',
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  merchantMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  messageTimestamp: {
    color: '#9CA3AF',
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A3C34',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
}); 