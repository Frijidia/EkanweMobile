import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapPickerProps {
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

export default function MapPicker({ onSelect }: MapPickerProps) {
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleMapPress = (e: any) => {
    const coords = {
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };
    setPosition(coords);
    onSelect(coords);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 14.6937,
          longitude: -17.4441,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
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
  },
  map: {
    flex: 1,
  },
});
