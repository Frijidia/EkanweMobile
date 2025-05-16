import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavbar } from '../components/BottomNavbar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfilInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isEditing, setIsEditing] = useState(false);

  // Simuler les données du profil
  const profile = {
    name: 'Sarah Martin',
    username: '@sarahmartin',
    bio: 'Influenceuse mode & lifestyle | Paris',
    followers: 12500,
    following: 850,
    posts: 342,
    categories: ['Mode', 'Lifestyle', 'Beauté'],
    stats: {
      engagement: '4.2%',
      averageLikes: 2500,
      averageComments: 180,
    },
    recentPosts: [
      {
        id: '1',
        image: require('../assets/post1.png'),
        likes: 2450,
        comments: 156,
      },
      {
        id: '2',
        image: require('../assets/post2.png'),
        likes: 1890,
        comments: 98,
      },
      {
        id: '3',
        image: require('../assets/post3.png'),
        likes: 3200,
        comments: 245,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Profil</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Icon name={isEditing ? "check" : "pencil"} size={24} color="#FF6B2E" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <Image 
            source={require('../assets/influencer1.png')} 
            style={styles.profileImage} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.username}>{profile.username}</Text>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                defaultValue={profile.bio}
                placeholder="Ajoutez une bio..."
                placeholderTextColor="#9CA3AF"
                multiline
              />
            ) : (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.followers}</Text>
            <Text style={styles.statLabel}>Abonnés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.following}</Text>
            <Text style={styles.statLabel}>Abonnements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.posts}</Text>
            <Text style={styles.statLabel}>Publications</Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          {profile.categories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="chart-line" size={24} color="#FF6B2E" />
              <Text style={styles.statValue}>{profile.stats.engagement}</Text>
              <Text style={styles.statLabel}>Taux d'engagement</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="heart" size={24} color="#FF6B2E" />
              <Text style={styles.statValue}>{profile.stats.averageLikes}</Text>
              <Text style={styles.statLabel}>Likes moyens</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="comment" size={24} color="#FF6B2E" />
              <Text style={styles.statValue}>{profile.stats.averageComments}</Text>
              <Text style={styles.statLabel}>Commentaires moyens</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentPostsSection}>
          <Text style={styles.sectionTitle}>Publications récentes</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.postsScroll}
          >
            {profile.recentPosts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.postCard}
                onPress={() => navigation.navigate('PostDetailsInfluenceur', { postId: post.id })}
              >
                <Image source={post.image} style={styles.postImage} />
                <View style={styles.postStats}>
                  <View style={styles.postStat}>
                    <Icon name="heart" size={16} color="#fff" />
                    <Text style={styles.postStatText}>{post.likes}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Icon name="comment" size={16} color="#fff" />
                    <Text style={styles.postStatText}>{post.comments}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <BottomNavbar />
    </View>
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
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  bio: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  bioInput: {
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A3C34',
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2A3C34',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FF6B2E',
    fontSize: 12,
    fontWeight: '500',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  recentPostsSection: {
    padding: 16,
  },
  postsScroll: {
    marginTop: 8,
  },
  postCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  postStats: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  postStatText: {
    color: '#fff',
    fontSize: 12,
  },
}); 