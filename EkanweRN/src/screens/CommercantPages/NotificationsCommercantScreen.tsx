import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { Navbar } from './Navbar';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: number;
  targetRoute?: string;
  dealId?: string;
  influenceurId?: string;
  type: 'message' | 'deal' | 'system';
}

export const NotificationsCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const notifRef = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notifRef, (snapshot) => {
      const notifList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(notifList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notifDocRef = doc(db, "users", user.uid, "notifications", notif.id);
      await updateDoc(notifDocRef, { read: true });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );

      if (notif.targetRoute) {
        const route = notif.targetRoute;
        if (route in navigation.getState().routes) {
          navigation.navigate(route as any, {
            dealId: notif.dealId,
            influenceurId: notif.influenceurId
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification :", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return 'chatbubble';
      case 'deal':
        return 'briefcase';
      case 'system':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const filteredNotifications = notifications
    .filter(notif => {
      const matchesSearch = notif.message.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || !notif.read;
      return matchesSearch && matchesFilter;
    });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B2E" />
        <Text style={styles.loadingText}>Chargement des notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
          <Image 
            source={require('../../assets/ekanwesign.png')} 
            style={styles.headerLogo}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Toutes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Non lues
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#1A2C24" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une notification"
            placeholderTextColor="#1A2C24"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notificationCard,
                !notif.read && styles.unreadNotification
              ]}
              onPress={() => handleNotificationClick(notif)}
            >
              <View style={styles.notificationHeader}>
                <Ionicons 
                  name={getNotificationIcon(notif.type)} 
                  size={24} 
                  color="#FF6B2E" 
                  style={styles.notificationIcon}
                />
                <Text style={styles.timestamp}>
                  {formatTimestamp(notif.createdAt)}
                </Text>
              </View>
              <Text style={styles.notificationText}>{notif.message}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucune notification {filter === 'unread' ? 'non lue' : ''} pour l'instant
            </Text>
          </View>
        )}
      </ScrollView>

      <Navbar />
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
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14210F',
  },
  badge: {
    backgroundColor: '#FF6B2E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#14210F',
  },
  activeFilter: {
    backgroundColor: '#1A2C24',
  },
  filterText: {
    color: '#14210F',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#14210F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#14210F',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B2E',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
  },
  notificationText: {
    fontSize: 14,
    color: '#14210F',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
