import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

interface Position {
  latitude: number;
  longitude: number;
}

interface LocationSelectorProps {
  position: Position | null;
  setPosition: (pos: Position) => void;
  setLocationName: (name: string) => void;
}

export default function LocationSelector({ position, setPosition, setLocationName }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [region, setRegion] = useState({
    latitude: 9.3077,
    longitude: 2.3158,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setPosition({ latitude, longitude });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        setLocationName(data.display_name || '');
      } catch (err) {
        console.error('Erreur reverse geocoding :', err);
      }
    })();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Erreur de recherche :', error);
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPosition({ latitude, longitude });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setLocationName(data.display_name || '');
    } catch (err) {
      console.error('Erreur reverse geocoding :', err);
    }
  };

  const handleResultSelect = (result: any) => {
    const newPosition = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    setPosition(newPosition);
    setLocationName(result.display_name);
    setRegion({
      latitude: newPosition.latitude,
      longitude: newPosition.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une adresse..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      {searchResults.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultItem}
              onPress={() => handleResultSelect(result)}
            >
              <Text>{result.display_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {position && (
          <Marker
            coordinate={position}
            title="Position sélectionnée"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 8,
  },
  searchContainer: {
    padding: 8,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    maxHeight: 200,
    backgroundColor: 'white',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  map: {
    flex: 1,
  },
});
