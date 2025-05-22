import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRole: 'influenceur' | 'commerçant';
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RoleBasedRoute({ children, allowedRole }: RoleBasedRouteProps) {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        const role = snap.data()?.role;
        setAuthorized(role === allowedRole);
      } else {
        setAuthorized(false);
      }
      setLoading(false);
    };

    checkRole();
  }, [allowedRole]);

  useEffect(() => {
    if (!loading && (!authorized)) {
      navigation.replace('Connection');
    }
  }, [loading, authorized, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5E7',
  },
  loadingText: {
    color: '#14210F',
    fontSize: 16,
  },
});
