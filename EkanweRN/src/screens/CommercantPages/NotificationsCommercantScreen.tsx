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
  createdAt: any;
  targetRoute?: string;
  dealId?: string;
  influenceurId?: string;
}

export const NotificationsCommercantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      })) as Notification[];
      setNotifications(notifList);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const notifDocRef = doc(db, 'users', user.uid, 'notifications', notif.id);
      await updateDoc(notifDocRef, { read: true });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );

      if (notif.targetRoute) {
        switch (notif.targetRoute) {
          case 'DealsDetailsCommercant':
            if (notif.dealId && notif.influenceurId) {
              navigation.navigate('DealsDetailsCommercant', {
                dealId: notif.dealId,
                influenceurId: notif.influenceurId
              });
            }
            break;
          case 'SuiviDealsCommercant':
            navigation.navigate('SuiviDealsCommercant' as never);
            break;
          case 'DealsCommercant':
            navigation.navigate('DealsCommercant' as never);
            break;
          default:
            if (notif.targetRoute in navigation.getState().routes) {
              navigation.navigate(notif.targetRoute as never);
            }
        }
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#14210F" />
            </TouchableOpacity>
            <Text style={styles.title}>Notifications</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
            <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
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

        {/*<View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>*/}
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5E7',
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A2C24',
  },
  backButton: {
    marginRight: 8,
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
  backButtonText: {
    fontSize: 16,
    color: '#1A2C24',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
