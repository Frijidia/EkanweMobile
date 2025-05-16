import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
// Types pour la navigation

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ValidateInscription = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const interval = setInterval(() => {
      // navigation.navigate('RegistrationStepOne');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground
      source={{
        uri: 'https://s3-alpha-sig.figma.com/img/766b/e8b9/25ea265fc6d5c0f04e3e93b27ecd65cb?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EsyWng5rz5MuEwYQEk01lU7LKsfv2EWoe-0bq8GtYOwvCr3abuoIOUk5UIU3it2DcnrX49Xu~~t-IdgxVen0GevBunbegAqHR-Jki-XrC1EnR84TWM8CrfsNvORud11qi3me9rQJIApdEysnnnPqTq4wtpdrQF9Tho0kRwj7r4IJOftLpWgG4ktpqP2iCobbbxs1KxnwQ7328NMqGPkUlWZ~TPbIg4oFsIzp8xDvk-c3TXJvy8UqR96LNu5zX1BNr~~VsdBcufw5AO8sOty0qgnylO6Lfr0dN-bWqe9zDc~e6PfZRxRupZ-t3vGrHT-KpU3Y0C~pK11-xCM4Tug1rw__'
      }}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/ekanwe-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              TA DEMANDE DE CANDIDATURE A ÉTÉ ENVOYÉE !
            </Text>
            <Image
              source={require('../../assets/validatepagelogo.png')}
              style={styles.validateLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.verificationTitle}>Vérifications</Text>

          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation pour finaliser votre inscription.
            </Text>
            <Text style={styles.messageText}>
              Si vous ne recevez pas d'email dans les prochaines minutes, vérifiez votre dossier spam.
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(26, 44, 36, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    backgroundColor: 'rgba(26, 44, 36, 0.7)',
    padding: 24,
    borderRadius: 8,
    width: '92%',
    maxWidth: 400,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 144,
    height: 144,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  validateLogo: {
    width: 128,
    height: 128,
    marginBottom: 40,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  messageContainer: {
    marginBottom: 40,
  },
  messageText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 8,
  },
});