import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  // Modal,
  // Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrationStepOne'>;

export const RegistrationStepOneScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    // naissance: '',
    pseudo: '',
    telephone: '',
  });
  const [pseudoError, setPseudoError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // let dateNaissance = null;
          // if (data.dateNaissance) {
          //   try {
          //     // S'assurer que la date est valide
          //     const date = new Date(data.dateNaissance);
          //     if (!isNaN(date.getTime())) {
          //       dateNaissance = date;
          //     }
          //   } catch (error) {
          //     console.error('Erreur de format de date:', error);
          //   }
          // }
          
          // setSelectedDate(dateNaissance);
          setFormData({
            nom: data.nom || '',
            prenoms: data.prenom || '',
            // naissance: dateNaissance ? format(dateNaissance, 'yyyy-MM-dd') : '',
            pseudo: data.pseudonyme || '',
            telephone: data.phone || '',
          });
        }
      } catch (err) {
        console.error('Erreur chargement données :', err);
      }
    };

    fetchUserData();
  }, []);

  const checkPseudoUnique = async (pseudo: string) => {
    setIsChecking(true);
    const q = query(collection(db, 'users'), where('pseudonyme', '==', pseudo));
    const snapshot = await getDocs(q);
    setPseudoError(snapshot.empty ? '' : 'Pseudonyme déjà utilisé');
    setIsChecking(false);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'pseudo') checkPseudoUnique(value.trim());
  };

  // const handleDateChange = (event: any, date?: Date) => {
  //   if (Platform.OS === 'android') {
  //     setShowDatePicker(false);
  //   }
    
  //   if (date) {
  //     try {
  //       setSelectedDate(date);
  //       setFormData(prev => ({
  //         ...prev,
  //         naissance: format(date, 'yyyy-MM-dd')
  //       }));
  //     } catch (error) {
  //       console.error('Erreur lors du changement de date:', error);
  //     }
  //   }
  // };

  // const handleDateConfirm = () => {
  //   if (selectedDate) {
  //     try {
  //       setFormData(prev => ({
  //         ...prev,
  //         naissance: format(selectedDate, 'yyyy-MM-dd')
  //       }));
  //     } catch (error) {
  //       console.error('Erreur lors de la confirmation de la date:', error);
  //     }
  //   }
  //   setShowDatePicker(false);
  // };

  const handleSubmit = async () => {
    const { nom, prenoms, pseudo, telephone } = formData;
    if (!nom || !prenoms || !pseudo || !telephone || pseudoError) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement.');
      return;
    }

    const user = auth.currentUser;
    if (!user) return Alert.alert('Erreur', 'Utilisateur non connecté');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        nom,
        prenom: prenoms,
        // dateNaissance: naissance,
        pseudonyme: pseudo,
        phone: telephone,
        inscription: '2',
      });
      navigation.navigate('InterestStep');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.step}>Étape 1/4</Text>
      <Text style={styles.title}>Informations</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom"
        placeholderTextColor="#ccc"
        value={formData.nom}
        onChangeText={(text) => handleChange('nom', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Prénoms"
        placeholderTextColor="#ccc"
        value={formData.prenoms}
        onChangeText={(text) => handleChange('prenoms', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Pseudonyme"
        placeholderTextColor="#ccc"
        value={formData.pseudo}
        onChangeText={(text) => handleChange('pseudo', text)}
      />
      {pseudoError ? <Text style={styles.error}>{pseudoError}</Text> : null}

      {/* <TouchableOpacity 
        style={styles.input} 
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.dateText, !formData.naissance && { color: '#ccc' }]}>
          {formData.naissance || 'Date de naissance (AAAA-MM-JJ)'}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButton}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.modalButton}>OK</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                locale="fr-FR"
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            locale="fr-FR"
          />
        )
      )} */}

      <TextInput
        style={styles.input}
        placeholder="Téléphone"
        placeholderTextColor="#ccc"
        keyboardType="phone-pad"
        value={formData.telephone}
        onChangeText={(text) => handleChange('telephone', text)}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('LoginOrConnect')}>
          <Text style={styles.backText}>RETOUR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !(formData.pseudo && !pseudoError) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={isChecking}
        >
          {isChecking ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>SUIVANT</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2C24',
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  step: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'right',
  },
  input: {
    borderColor: 'white',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    color: 'white',
  },
  error: {
    color: '#f87171',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backBtn: {
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  backText: {
    color: 'white',
    fontSize: 14,
  },
  nextBtn: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  nextText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1A2C24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButton: {
    color: '#FF6B2E',
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
  },
  datePicker: {
    height: 200,
    backgroundColor: '#1A2C24',
  },
});
