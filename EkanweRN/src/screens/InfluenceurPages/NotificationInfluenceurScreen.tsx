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
import { collection, onSnapshot, query, orderBy, updateDoc, doc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavbar } from './BottomNavbar';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NotificationType {
  id: string;
  message: string;
  targetRoute?: string;
  read: boolean;
  type: 'message' | 'deal' | 'system';
  createdAt: number;
  data?: any;
}

export const NotificationInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      })) as NotificationType[];

      setNotifications(notifList);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors du chargement des notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notif: NotificationType) => {
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
          navigation.navigate(route as any, notif.data);
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
      const matchesSearch = notif.message.toLowerCase().includes(searchQuery.toLowerCase());
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
        <TouchableOpacity onPress={() => navigation.navigate('DealsInfluenceur')}>
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
            value={searchQuery}
            onChangeText={setSearchQuery}
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>

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
  titleContainer: {
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -16,
    backgroundColor: '#FF6B2E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  activeFilter: {
    backgroundColor: '#FF6B2E',
  },
  filterText: {
    color: '#1A2C24',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 0,
  },
  searchInputContainer: {
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
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#FFF3E0',
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
    fontWeight: '600',
    color: '#1A2C24',
  },
  emptyState: {
    marginTop: 80,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5E7',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    marginTop: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#1A2C24',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#1A2C24',
    fontSize: 16,
    textAlign: 'center',
  },
}); 