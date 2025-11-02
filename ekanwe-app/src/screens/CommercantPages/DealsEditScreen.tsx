import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, Alert, Platform, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../../firebase/firebase';
import {
    collection, doc, getDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DealsEdit'>;

export const DealsEditScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const { dealId } = route.params;

    const [loading, setLoading] = useState(true);
    const [deal, setDeal] = useState<any>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [validUntil, setValidUntil] = useState('');
    const [conditions, setConditions] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [locationName, setLocationName] = useState('');
    const [region, setRegion] = useState({
        latitude: 5.35,
        longitude: -4.01,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const availableInterests = ["Mode", "Cuisine", "Voyage", "Beauté", "Sport", "Technologie", "Gaming",
        "Musique", "Cinéma", "Fitness", "Développement personnel", "Finance",
        "Photographie", "Lecture", "Art", "Éducation", "Animaux", "Nature", "Business"
    ];
    const availableTypes = ["Post Instagram", "Story Instagram", "Vidéo TikTok", "Vidéo Youtube", "Publication Facebook", "Autre"];

    // Toggle utilitaire (réutilisé pour intérêts et types)
    const toggleSelection = (item: string, list: string[], setter: (v: string[]) => void) => {
        if (list.includes(item)) setter(list.filter(i => i !== item));
        else setter([...list, item]);
    };

    useEffect(() => {
        (async () => {
            try {
                const docRef = doc(db, "deals", dealId);
                const snap = await getDoc(docRef);
                if (!snap.exists()) {
                    Alert.alert("Erreur", "Ce deal n'existe plus.");
                    navigation.goBack();
                    return;
                }
                const data = snap.data();
                setDeal({ id: snap.id, ...data });

                setTitle(data.title || '');
                setDescription(data.description || '');
                setSelectedInterests(data.interests || []);
                setSelectedTypes(data.typeOfContent || []);
                setValidUntil(data.validUntil || '');
                setConditions(data.conditions || '');
                setImageUri(data.imageUrl || null);
                setPosition(data.locationCoords || null);
                setLocationName(data.locationName || '');
                if (data.validUntil) {
                    try {
                        setSelectedDate(new Date(data.validUntil));
                    } catch (e) {
                        // pas bloquant
                    }
                }

                // demander localisation device pour carte
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let location = await Location.getCurrentPositionAsync({});
                    setRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Erreur", "Impossible de charger le deal.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        })();
    }, [dealId]);

    const uploadDealImageToFirebase = async (uri: string): Promise<string | null> => {
        try {
            const storageInstance = getStorage();
            const filename = `${auth.currentUser?.uid}_${Date.now()}.jpg`;
            const reference = ref(storageInstance, `dealImages/${filename}`);

            const response = await fetch(uri);
            const blob = await response.blob();
            await uploadBytes(reference, blob);
            return await getDownloadURL(reference);
        } catch (error) {
            console.error("Erreur upload Firebase:", error);
            return null;
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                const downloadURL = await uploadDealImageToFirebase(uri);
                if (downloadURL) setImageUri(downloadURL);
            }
        } catch (error) {
            console.error("Erreur sélection image:", error);
            Alert.alert("Erreur", "Impossible de sélectionner l'image");
        }
    };

    const getLocationName = async (latitude: number, longitude: number) => {
        try {
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result.length > 0) {
                const place = result[0];
                return `${place.city || ''}${place.city ? ', ' : ''}${place.country || ''}`.trim();
            }
        } catch (e) {
            console.warn('reverseGeocode failed', e);
        }
        return "Inconnu";
    };

    const handleMapPress = async (e: MapPressEvent) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setPosition({ lat: latitude, lng: longitude });
        setLocationName(await getLocationName(latitude, longitude));
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await Location.geocodeAsync(searchQuery);
            if (results.length > 0) {
                const { latitude, longitude } = results[0];
                setRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
                setPosition({ lat: latitude, lng: longitude });
                setLocationName(await getLocationName(latitude, longitude));
            } else {
                Alert.alert('Erreur', 'Adresse non trouvée');
            }
        } catch (error) {
            console.error('Erreur de recherche:', error);
            Alert.alert('Erreur', 'Impossible de trouver cette adresse');
        } finally {
            setIsSearching(false);
        }
    };

    const handleUpdate = async () => {
        if (!title || !description || !validUntil || !conditions || !imageUri || !position || selectedInterests.length === 0 || selectedTypes.length === 0) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs requis.');
            return;
        }

        try {
            setLoading(true);
            let uploadedImageUrl = imageUri;
            if (imageUri && imageUri.startsWith('file://')) {
                const url = await uploadDealImageToFirebase(imageUri);
                if (url) uploadedImageUrl = url;
            }

            await updateDoc(doc(db, 'deals', dealId), {
                title,
                description,
                validUntil,
                conditions,
                interests: selectedInterests,
                typeOfContent: selectedTypes,
                imageUrl: uploadedImageUrl,
                locationCoords: { lat: position.lat, lng: position.lng },
                locationName,
                updatedAt: serverTimestamp(),
            });

            Alert.alert('Succès', 'Le deal a été mis à jour.');
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Erreur', "Impossible de mettre à jour le deal.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const docRef = doc(db, 'deals', dealId);
            const snap = await getDoc(docRef);
            if (!snap.exists()) {
                Alert.alert('Erreur', 'Deal introuvable.');
                return;
            }

            const data = snap.data();
            if (data?.candidatures && data.candidatures.length > 0) {
                Alert.alert('Impossible', "Ce deal a déjà des candidatures. Vous ne pouvez pas le supprimer.");
                return;
            }

            await deleteDoc(docRef);
            Alert.alert('Succès', 'Le deal a été supprimé.');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', "Impossible de supprimer ce deal.");
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B2E" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#14210F" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Modifier le Deal</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => navigation.navigate('NotificationsCommercant')}>
                        <Image source={require('../../assets/clochenotification.png')} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('DealsCommercant')}>
                        <Image source={require('../../assets/ekanwesign.png')} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                <Image source={{ uri: imageUri || 'https://via.placeholder.com/600x200' }} style={styles.image} />
                <Text style={styles.imageText}>📸 Changer l'image</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Titre</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titre du deal" />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Décrivez le deal"
                multiline
            />

            {/* -------- INTÉRÊTS -------- */}
            <Text style={styles.label}>Intérêts</Text>
            <View style={styles.tagContainer}>
                {availableInterests.map(tag => (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.tag, selectedInterests.includes(tag) && styles.tagSelected]}
                        onPress={() => toggleSelection(tag, selectedInterests, setSelectedInterests)}
                    >
                        <Text style={selectedInterests.includes(tag) ? styles.tagTextSelected : styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* -------- TYPE DE CONTENU -------- */}
            <Text style={styles.label}>Type de contenu</Text>
            <View style={styles.tagContainer}>
                {availableTypes.map(tag => (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.tag, selectedTypes.includes(tag) && styles.tagSelected]}
                        onPress={() => toggleSelection(tag, selectedTypes, setSelectedTypes)}
                    >
                        <Text style={selectedTypes.includes(tag) ? styles.tagTextSelected : styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Date de validité</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                <Text style={validUntil ? styles.dateText : styles.datePlaceholder}>{validUntil || 'Sélectionner une date'}</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
                <Modal visible={showDatePicker} transparent={true} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.modalButton}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setValidUntil(format(selectedDate, 'yyyy-MM-dd')); setShowDatePicker(false); }}>
                                    <Text style={styles.modalButton}>OK</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={(e, d) => { if (d) setSelectedDate(d); }}
                                minimumDate={new Date()}
                                locale="fr-FR"
                                style={styles.datePicker}
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(e, d) => { if (d) { setSelectedDate(d); setValidUntil(format(d, 'yyyy-MM-dd')); } setShowDatePicker(false); }}
                        minimumDate={new Date()}
                        locale="fr-FR"
                    />
                )
            )}

            <Text style={styles.label}>Conditions</Text>
            <TextInput
                style={[styles.input, styles.multiline]}
                value={conditions}
                onChangeText={setConditions}
                placeholder="Conditions du deal"
                multiline
            />

            <Text style={styles.label}>Localisation</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Rechercher une adresse..."
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
                    {isSearching ? <ActivityIndicator size="small" color="#FF6B2E" /> : <Ionicons name="search" size={24} color="#FF6B2E" />}
                </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
                <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion} onPress={handleMapPress}>
                    {position && (
                        <Marker coordinate={{ latitude: position.lat, longitude: position.lng }} title="Position choisie" />
                    )}
                </MapView>
            </View>

            <View style={styles.tagContainer}>
                {position ? (
                    <Text style={styles.locationText}>{locationName || `Latitude: ${position.lat.toFixed(5)} / Longitude: ${position.lng.toFixed(5)}`}</Text>
                ) : (
                    <Text style={styles.locationText}>Touchez la carte ou recherchez une adresse</Text>
                )}
            </View>

            <TouchableOpacity onPress={handleUpdate} disabled={loading} style={styles.submit}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Mettre à jour</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteText}>Supprimer</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5E7',
        paddingTop: 40,
        paddingBottom: 80,
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 16,
    },
    backButton: {
        marginRight: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#14210F'
    },

    imageContainer: {
        alignItems: 'center',
        marginBottom: 16
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 8
    },
    imageText: {
        marginTop: 8,
        fontSize: 14,
        color: '#FF6B2E'
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 16,
        marginBottom: 4,
        color: '#1A2C24'
    },
    icon: {
        width: 24,
        height: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: 'top'
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginRight: 8,
        marginTop: 8,
    },
    tagSelected: {
        backgroundColor: '#FF6B2E',
        borderColor: '#FF6B2E'
    },
    tagText: {
        color: '#1A2C24'
    },
    tagTextSelected: {
        color: '#fff'
    },
    fakeMap: {
        height: 60,
        backgroundColor: '#1A2C24',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    submit: {
        marginTop: 24,
        backgroundColor: '#FF6B2E',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        paddingBottom: 20,
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        paddingBottom: 10,
    },
    mapContainer: {
        height: 200,
        marginVertical: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    searchButton: {
        width: 44,
        height: 44,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        color: '#1A2C24',
        marginTop: 8,
        textAlign: 'center',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 6,
    },
    dateText: {
        color: '#1A2C24',
    },
    datePlaceholder: {
        color: '#999',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalButton: {
        color: '#FF6B2E',
        fontSize: 16,
        fontWeight: '600',
    },
    datePicker: {
        height: 200,
    },
    deleteButton: {
        marginTop: 16,
        backgroundColor: '#FF3B30',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default DealsEditScreen;
