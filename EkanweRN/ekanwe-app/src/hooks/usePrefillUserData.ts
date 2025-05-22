import { useEffect } from "react";
import { Alert } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export const usePrefillUserData = (fields: string[], onDataFetched: (data: any) => void) => {
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const filtered: any = {};
          fields.forEach((field) => {
            if (data[field]) {
              filtered[field] = data[field];
              Alert.alert('Data', data[field]);
              Alert.alert('Field', field);
            }
          });
          onDataFetched(filtered);
        }
      } catch (error) {
        console.error("Erreur lors du préremplissage:", error);
      }
    };
    fetchData();
  }, [fields, onDataFetched]);
};
