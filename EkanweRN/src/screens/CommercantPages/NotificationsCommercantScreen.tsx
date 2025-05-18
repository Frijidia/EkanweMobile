import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import Navbar from '../../components/Navbar';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationPageCommercant() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const notifRef = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notifRef, (snapshot) => {
      const notifList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifList);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notif) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notifDocRef = doc(db, 'users', user.uid, 'notifications', notif.id);
      await updateDoc(notifDocRef, { read: true });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );

      if (notif.targetRoute) {
        navigation.navigate(notif.targetRoute);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification :', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) =>
    n.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
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
          <Ionicons name="home-outline" size={24} color="#1A2C24" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="black" style={styles.searchIcon} />
        <TextInput
          placeholder="Recherche"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            onPress={() => handleNotificationClick(notif)}
            style={[styles.notificationCard, notif.read ? styles.readCard : styles.unreadCard]}
          >
            <Text style={styles.notificationText}>{notif.message}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune notification pour l'instant</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <Navbar />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -16,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  readCard: {
    backgroundColor: 'white',
  },
  unreadCard: {
    backgroundColor: '#FFE4CC',
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C24',
  },
  emptyContainer: {
    marginTop: 80,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5E7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
  },
  buttonContainer: {
    marginVertical: 40,
  },
  backButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1A2C24',
  },
});
