import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

type SettingItem = {
  id: string;
  title: string;
  type: 'toggle' | 'link';
  value?: boolean;
  onPress?: () => void;
};

export const Settings = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'notifications',
      title: 'Notifications',
      type: 'toggle',
      value: true,
    },
    {
      id: 'darkMode',
      title: 'Mode sombre',
      type: 'toggle',
      value: true,
    },
    {
      id: 'language',
      title: 'Langue',
      type: 'link',
      onPress: () => console.log('Changer la langue'),
    },
    {
      id: 'privacy',
      title: 'Confidentialité',
      type: 'link',
      onPress: () => console.log('Paramètres de confidentialité'),
    },
    {
      id: 'help',
      title: 'Aide et support',
      type: 'link',
      onPress: () => console.log('Aide et support'),
    },
    {
      id: 'about',
      title: 'À propos',
      type: 'link',
      onPress: () => console.log('À propos'),
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
    );
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.type === 'link' ? item.onPress : undefined}
    >
      <Text style={styles.settingTitle}>{item.title}</Text>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={() => toggleSetting(item.id)}
          trackColor={{ false: '#374151', true: '#007AFF' }}
          thumbColor="white"
        />
      ) : (
        <Text style={styles.settingArrow}>→</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {settings.map(renderSettingItem)}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Splash')}
      >
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2C24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    color: 'white',
    fontSize: 24,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3C34',
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
  },
  settingArrow: {
    color: '#9CA3AF',
    fontSize: 20,
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 