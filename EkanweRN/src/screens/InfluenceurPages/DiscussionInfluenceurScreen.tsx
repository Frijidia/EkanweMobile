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
        image: require('../../assets/profile.png'),
      },
      lastMessage: 'Bonjour, nous sommes intéressés par votre profil...',
      timestamp: '10:30',
      unread: true,
    },
    {
      id: '2',
      merchant: {
        name: 'Fashion Store',
        image: require('../../assets/profile.png'),
      },
      lastMessage: 'Merci pour votre candidature !',
      timestamp: 'Hier',
      unread: false,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#1A2C24" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor="#1A2C24"
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
            <Icon name="message-outline" size={64} color="#1A2C24" />
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
    backgroundColor: '#EBEBDF',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  title: {
    color: '#1A2C24',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#1A2C24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#1A2C24',
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1A2C24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
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
    color: '#1A2C24',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#666666',
    fontSize: 12,
  },
  lastMessage: {
    color: '#666666',
    fontSize: 14,
  },
  unreadMessage: {
    color: '#1A2C24',
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
    color: '#1A2C24',
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
    shadowColor: '#1A2C24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 