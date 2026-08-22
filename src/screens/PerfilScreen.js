import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getRatingsByUser } from '../utils/ratings';
import { getItemById } from '../services/catalogService';

const TYPE_LABELS = {
  filme: 'Filme',
  serie: 'Série',
  musica: 'Música',
  documentario: 'Documentário',
};

function formatReviewDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recarrega as avaliações do usuário sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadUserRatings() {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        try {
          const rawRatings = await getRatingsByUser({ userId: user.id });
          // Enriquece cada avaliação com as informações do item do catálogo
          const enriched = rawRatings
            .map((rating) => {
              const item = getItemById(rating.itemId);
              return {
                ...rating,
                item: item || {
                  id: rating.itemId,
                  title: 'Item não encontrado',
                  type: '',
                  year: '',
                  image: null,
                },
              };
            })
            // Ordena as avaliações mais recentes primeiro
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

          if (isActive) {
            setUserRatings(enriched);
          }
        } catch (error) {
          console.error('Erro ao carregar avaliações do usuário:', error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadUserRatings();

      return () => {
        isActive = false;
      };
    }, [user?.id])
  );

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza de que deseja encerrar a sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card do Usuário Logado */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{userInitial}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Sem e-mail'}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userRatings.length}</Text>
              <Text style={styles.statLabel}>
                {userRatings.length === 1 ? 'Avaliação Feita' : 'Avaliações Feitas'}
              </Text>
            </View>
          </View>
        </View>

        {/* Seção de Avaliações do Usuário */}
        <View style={styles.ratingsSection}>
          <View style={styles.ratingsHeaderRow}>
            <Text style={styles.sectionTitle}>Minhas Avaliações</Text>
            {userRatings.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{userRatings.length}</Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#E63950" />
              <Text style={styles.loadingText}>Carregando avaliações...</Text>
            </View>
          ) : userRatings.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>Você ainda não avaliou nada</Text>
              <Text style={styles.emptySubtitle}>
                Navegue pelo catálogo e avalie filmes, séries, músicas e documentários para vê-los aqui!
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('List')}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>Explorar Catálogo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ratingsList}>
              {userRatings.map((review) => {
                const item = review.item;
                const hasComment =
                  typeof review.comment === 'string' &&
                  review.comment.trim().length > 0;

                return (
                  <TouchableOpacity
                    key={review.itemId}
                    style={styles.ratingCard}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('Detalhes', { id: review.itemId })
                    }
                  >
                    <View style={styles.itemRow}>
                      {item.image ? (
                        <Image
                          source={item.image}
                          style={styles.itemCover}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.itemPlaceholder}>
                          <Text style={styles.itemPlaceholderEmoji}>🎬</Text>
                        </View>
                      )}

                      <View style={styles.itemDetails}>
                        <View style={styles.itemMetaRow}>
                          {item.type ? (
                            <View style={styles.typeBadge}>
                              <Text style={styles.typeBadgeText}>
                                {TYPE_LABELS[item.type] || item.type}
                              </Text>
                            </View>
                          ) : null}
                          {item.year ? (
                            <Text style={styles.itemYear}>• {item.year}</Text>
                          ) : null}
                        </View>

                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>

                        {/* Estrelas da Avaliação */}
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Text
                              key={s}
                              style={[
                                styles.starIcon,
                                s <= review.rating
                                  ? styles.starFilled
                                  : styles.starEmpty,
                              ]}
                            >
                              ★
                            </Text>
                          ))}
                          <Text style={styles.ratingScore}>
                            {review.rating}/5
                          </Text>
                          {review.date ? (
                            <Text style={styles.reviewDate}>
                              • {formatReviewDate(review.date)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </View>

                    {/* Comentário (se houver) */}
                    {hasComment && (
                      <View style={styles.commentBox}>
                        <Text style={styles.commentText}>
                          "{review.comment.trim()}"
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Botão de Logout no final da tela */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>🚪 Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#141218',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1B24',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#E63950',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 60,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#1E1B24',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2733',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(230, 57, 80, 0.2)',
    borderWidth: 2,
    borderColor: '#E63950',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    color: '#E63950',
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8A8794',
    fontWeight: '500',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2A2733',
    justifyContent: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E63950',
  },
  statLabel: {
    fontSize: 12,
    color: '#8A8794',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  ratingsSection: {
    marginBottom: 24,
  },
  ratingsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: 'rgba(230, 57, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 80, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countBadgeText: {
    color: '#E63950',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8A8794',
    marginTop: 10,
    fontSize: 14,
  },
  emptyBox: {
    backgroundColor: '#1E1B24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2733',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#8A8794',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  exploreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2A2733',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34313D',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ratingsList: {
    gap: 0,
  },
  ratingCard: {
    backgroundColor: '#1E1B24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2733',
    padding: 14,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCover: {
    width: 50,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#2A2733',
  },
  itemPlaceholder: {
    width: 50,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#2A2733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPlaceholderEmoji: {
    fontSize: 22,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeBadge: {
    backgroundColor: 'rgba(230, 57, 80, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  typeBadgeText: {
    color: '#E63950',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemYear: {
    fontSize: 11,
    color: '#8A8794',
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 13,
    marginRight: 1,
  },
  starFilled: {
    color: '#F5B400',
  },
  starEmpty: {
    color: '#34313D',
  },
  ratingScore: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  reviewDate: {
    color: '#8A8794',
    fontSize: 11,
    marginLeft: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#4C4956',
    marginLeft: 6,
  },
  commentBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2733',
  },
  commentText: {
    color: '#C7C4D0',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  logoutContainer: {
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#1E1B24',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 80, 0.4)',
  },
  logoutButtonText: {
    color: '#E63950',
    fontWeight: '700',
    fontSize: 15,
  },
});
