import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import sign from '../assets/ekanwesign.png';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRole?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PrivateRoute({ children, allowedRole }: PrivateRouteProps) {
  const navigation = useNavigation<NavigationProp>();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        setStatus('unauthorized');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setStatus('unauthorized');
        return;
      }

      const userData = userDoc.data();
      if (allowedRole && userData.role !== allowedRole) {
        setStatus('unauthorized');
        return;
      }

      setStatus('authorized');
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (status === 'unauthorized') {
      navigation.replace('LoginOrSignup', {
        error: 'Vous devez être connecté avec le bon rôle pour accéder à cette page.',
      });
    }
  }, [status, navigation]);

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Image source={sign} style={styles.logo} />
        </View>
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    color: '#14210F',
    marginTop: 16,
  },
});
