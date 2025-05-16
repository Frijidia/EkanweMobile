import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PostDetailsRouteProp = RouteProp<RootStackParamList, 'PostDetailsInfluenceur'>;

export const PostDetailsInfluenceurScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PostDetailsRouteProp>();

  // Simuler les données du post
  const post = {
    id: route.params.postId,
    image: require('../assets/post1.png'),
    caption: 'Nouvelle collection printemps 🌸 #fashion #spring #style',
    likes: 2450,
    commentCount: 156,
    timestamp: '2 heures',
    stats: {
      reach: 12500,
      engagement: '4.2%',
      saves: 320,
    },
    comments: [
      {
        id: '1',
        user: 'Marie Dupont',
        text: 'Superbe collection ! 😍',
        timestamp: '1h',
        likes: 24,
      },
      {
        id: '2',
        user: 'Sophie Martin',
        text: 'J\'adore ces couleurs !',
        timestamp: '45min',
        likes: 12,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Publication</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView>
        <Image source={post.image} style={styles.postImage} />

        <View style={styles.content}>
          <View style={styles.actions}>
            <View style={styles.actionGroup}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="heart-outline" size={24} color="#fff" />
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="comment-outline" size={24} color="#fff" />
                <Text style={styles.actionText}>{post.commentCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="bookmark-outline" size={24} color="#fff" />
                <Text style={styles.actionText}>{post.stats.saves}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share-variant" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.caption}>{post.caption}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="eye" size={24} color="#FF6B2E" />
                <Text style={styles.statValue}>{post.stats.reach}</Text>
                <Text style={styles.statLabel}>Portée</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="chart-line" size={24} color="#FF6B2E" />
                <Text style={styles.statValue}>{post.stats.engagement}</Text>
                <Text style={styles.statLabel}>Engagement</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="bookmark" size={24} color="#FF6B2E" />
                <Text style={styles.statValue}>{post.stats.saves}</Text>
                <Text style={styles.statLabel}>Sauvegardes</Text>
              </View>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Commentaires</Text>
            {post.comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.commentAction}>
                    <Icon name="heart-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.commentActionText}>{comment.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.commentAction}>
                    <Icon name="reply" size={16} color="#9CA3AF" />
                    <Text style={styles.commentActionText}>Répondre</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  placeholder: {
    width: 40,
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  content: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
  shareButton: {
    padding: 8,
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  timestamp: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 24,
  },
  statsSection: {
    marginBottom: 24,
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
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  commentsSection: {
    marginBottom: 24,
  },
  commentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentTimestamp: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  commentText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
}); 