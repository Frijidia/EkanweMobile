import React from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'message' | 'campaign' | 'system';
  isRead: boolean;
};

export const Notifications = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();

  // Données de test
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Nouveau message',
      message: 'Sophie Martin a répondu à votre message',
      timestamp: 'Il y a 5 min',
      type: 'message',
      isRead: false,
    },
    {
      id: '2',
      title: 'Nouvelle campagne',
      message: 'Une nouvelle campagne correspond à vos critères',
      timestamp: 'Il y a 1h',
      type: 'campaign',
      isRead: true,
    },
    {
      id: '3',
      title: 'Mise à jour système',
      message: 'Nouvelle fonctionnalité disponible',
      timestamp: 'Il y a 2h',
      type: 'system',
      isRead: true,
    },
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'campaign':
        return '📢';
      case 'system':
        return '⚙️';
      default:
        return '📌';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => {
        if (item.type === 'message') {
          navigation.navigate('Chat', { userId: item.id });
        } else if (item.type === 'campaign') {
          navigation.navigate('CampaignDetails', { campaignId: item.id });
        }
      }}
    >
      <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    color: 'white',
    fontSize: 24,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  notificationsList: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#2A3C34',
    borderRadius: 12,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: '#1E3A2F',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  notificationMessage: {
    color: '#9CA3AF',
    fontSize: 14,
  },
}); 