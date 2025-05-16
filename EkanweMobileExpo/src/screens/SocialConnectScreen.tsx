import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const socialNetworks = [
  {
    name: 'Instagram',
    icon: require('../assets/instagram.png'),
    color: '#E1306C',
  },
  {
    name: 'TikTok',
    icon: require('../assets/tiktok.png'),
    color: '#000000',
  },
  {
    name: 'YouTube',
    icon: require('../assets/youtube.png'),
    color: '#FF0000',
  },
  {
    name: 'Facebook',
    icon: require('../assets/facebook.png'),
    color: '#1877F2',
  },
  {
    name: 'Twitter',
    icon: require('../assets/twitter.png'),
    color: '#1DA1F2',
  },
];

export const SocialConnectScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [connectedNetworks, setConnectedNetworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleNetwork = (network: string) => {
    if (connectedNetworks.includes(network)) {
      setConnectedNetworks(connectedNetworks.filter(n => n !== network));
    } else {
      setConnectedNetworks([...connectedNetworks, network]);
    }
  };

  const handleNext = async () => {
    if (connectedNetworks.length === 0) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Sauvegarder les réseaux sociaux connectés
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('PortfolioStep');
    } catch (err) {
      // Gérer l'erreur
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/ekanwe-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Étape 3</Text>
          <Text style={styles.subtitle}>Connectez vos réseaux sociaux</Text>
        </View>

        <View style={styles.networksContainer}>
          {socialNetworks.map((network) => (
            <TouchableOpacity
              key={network.name}
              style={[
                styles.networkButton,
                connectedNetworks.includes(network.name) && { backgroundColor: network.color },
              ]}
              onPress={() => toggleNetwork(network.name)}
            >
              <Image source={network.icon} style={styles.networkIcon} />
              <Text
                style={[
                  styles.networkText,
                  connectedNetworks.includes(network.name) && styles.connectedNetworkText,
                ]}
              >
                {network.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('InterestStep')}
          >
            <Text style={styles.backButtonText}>RETOUR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.nextButton,
              connectedNetworks.length === 0 && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={loading || connectedNetworks.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>SUIVANT</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 144,
    height: 144,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  networksContainer: {
    gap: 16,
    marginBottom: 24,
  },
  networkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  networkIcon: {
    width: 24,
    height: 24,
  },
  networkText: {
    color: '#fff',
    fontSize: 16,
  },
  connectedNetworkText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#FF6B2E',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 