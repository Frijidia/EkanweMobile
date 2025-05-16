import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from '../components/BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const NotificationInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const notifications = [
    {
      id: '1',
      type: 'message',
      title: 'Nouveau message',
      description: 'Le Petit Bistrot vous a envoyé un message',
      timestamp: 'Il y a 5 min',
      image: require('../assets/merchant1.png'),
      unread: true,
    },
    {
      id: '2',
      type: 'deal',
      title: 'Deal accepté',
      description: 'Votre candidature pour "Collection Mode" a été acceptée',
      timestamp: 'Il y a 1h',
      image: require('../assets/deal2.png'),
      unread: true,
    },
    {
      id: '3',
      type: 'system',
      title: 'Mise à jour',
      description: 'De nouvelles fonctionnalités sont disponibles',
      timestamp: 'Il y a 2h',
      icon: 'update',
      unread: false,
    },
    // Ajoutez plus de notifications ici
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return 'message';
      case 'deal':
        return 'briefcase';
      case 'system':
        return 'update';
      default:
        return 'bell';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                notification.unread && styles.unreadNotification,
              ]}
              onPress={() => {
                if (notification.type === 'message') {
                  navigation.navigate('ChatInfluenceur', { conversationId: '1' });
                } else if (notification.type === 'deal') {
                  navigation.navigate('DealDetailsInfluenceur', { dealId: '2' });
                }
              }}
            >
              {notification.image ? (
                <Image source={notification.image} style={styles.notificationImage} />
              ) : (
                <View style={styles.iconContainer}>
                  <Icon 
                    name={getNotificationIcon(notification.type)} 
                    size={24} 
                    color="#FF6B2E" 
                  />
                </View>
              )}
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationDescription}>
                  {notification.description}
                </Text>
                <Text style={styles.timestamp}>{notification.timestamp}</Text>
              </View>
              {notification.unread && (
                <View style={styles.unreadDot} />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="bell-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              Vous n'avez pas de notifications
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    color: '#9CA3AF',
    fontSize: 12,
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
  },
}); 