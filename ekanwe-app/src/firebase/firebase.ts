import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDyRgBYPs6qUJpjr9rW4F8nE4s6YwY-g-k",
  authDomain: "ekanwe-app.firebaseapp.com",
  projectId: "ekanwe-app",
  storageBucket: "ekanwe-app.firebasestorage.app",
  messagingSenderId: "177322625777",
  appId: "1:177322625777:web:3e8a67a4d99cf388b13750",
  measurementId: "G-17MSPHGKVV"
};

const app = initializeApp(firebaseConfig);
//const auth = initializeAuth(app, {
//  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
//});
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { db, storage, functions, auth };
