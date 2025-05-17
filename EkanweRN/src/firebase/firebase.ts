import { initializeApp } from 'firebase/app';
//import { getAuth } from 'firebase/auth';
//import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAs9Ol9gHfqcl9CJsG-uxyDuInN5CPui6Q",
  authDomain: "ekanwe-96b6c.firebaseapp.com",
  projectId: "ekanwe-96b6c",
  storageBucket: "ekanwe-96b6c.firebasestorage.app",
  messagingSenderId: "862152717069",
  appId: "1:862152717069:web:efb3d771aa9c5ebfa2f644"
};

const app = initializeApp(firebaseConfig);
//const auth = initializeAuth(app, {
//  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
//});
//const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { db, storage, functions };
