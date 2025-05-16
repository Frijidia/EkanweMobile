import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from './BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DiscussionInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: '1',
      merchant: {
        name: 'Le Petit Bistrot',
        //image: require('https://picsum.photos/200/300'),
      },
      lastMessage: 'Bonjour, nous sommes intéressés par votre profil...',
      timestamp: '10:30',
      unread: true,
    },
    {
      id: '2',
      merchant: {
        name: 'Fashion Store',
        //image: require('https://picsum.photos/200/300'),
      },
      lastMessage: 'Merci pour votre candidature !',
      timestamp: 'Hier',
      unread: false,
    },
    // Ajoutez plus de conversations ici
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              onPress={() => navigation.navigate('ChatInfluenceur', { conversationId: conversation.id })}
            >
              <Image source={conversation.merchant.image} style={styles.merchantImage} />
              <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.merchantName}>{conversation.merchant.name}</Text>
                  <Text style={styles.timestamp}>{conversation.timestamp}</Text>
                </View>
                <Text 
                  style={[
                    styles.lastMessage,
                    conversation.unread && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
              </View>
              {conversation.unread && (
                <View style={styles.unreadDot} />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="message-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore de messages
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('DealsInfluenceur')}
            >
              <Text style={styles.exploreButtonText}>Explorer les deals</Text>
            </TouchableOpacity>
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
    backgroundColor: '#1A2C24',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  merchantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  merchantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  lastMessage: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  unreadMessage: {
    color: '#fff',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B2E',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6B2E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 