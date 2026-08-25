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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getRatingsByUser } from '../utils/ratings';
import { getProfileExtras } from '../utils/profile';
import { getItemById } from '../services/catalogService';
import { catalogImages } from '../data/images';

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
  const { colors, isDark } = useTheme();
  const [userRatings, setUserRatings] = useState([]);
  const [profileExtras, setProfileExtras] = useState({
    photoUri: null,
    favoriteItemId: null,
    favoriteType: null,
  });
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  // Recarrega as avaliações e dados extras do usuário sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadUserData() {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        try {
          const [rawRatings, extras] = await Promise.all([
            getRatingsByUser({ userId: user.id }),
            getProfileExtras({ userId: user.id }),
          ]);

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
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

          if (isActive) {
            setUserRatings(enriched);
            setProfileExtras(extras);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadUserData();

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
  const favoriteItem = profileExtras.favoriteItemId
    ? getItemById(profileExtras.favoriteItemId)
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header com Título e Botão de Configurações */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
          },
        ]}
      >
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Meu Perfil</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Gerencie suas informações e preferências
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.settingsHeaderButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
          onPress={() => navigation.navigate('Configuracoes')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsHeaderIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card do Usuário Logado */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          {profileExtras.photoUri ? (
            <Image
              source={{ uri: profileExtras.photoUri }}
              style={[
                styles.avatarLargeImage,
                {
                  borderColor: colors.primary,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.avatarLarge,
                {
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.avatarLargeText, { color: colors.primary }]}>
                {userInitial}
              </Text>
            </View>
          )}

          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name || 'Usuário'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || 'Sem e-mail'}
          </Text>

          {/* Estatística de Avaliações */}
          <View style={[styles.statsContainer, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {userRatings.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {userRatings.length === 1 ? 'Avaliação Feita' : 'Avaliações Feitas'}
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Preferências do Usuário (Foto, Favorito, Tipo) */}
        {(profileExtras.favoriteType || favoriteItem) && (
          <View
            style={[
              styles.preferencesCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.preferencesHeader}>
              <Text style={[styles.preferencesTitle, { color: colors.text }]}>
                ⭐ Favoritos
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Configuracoes')}
                activeOpacity={0.7}
              >
                <Text style={[styles.editPreferencesText, { color: colors.primary }]}>
                  Editar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tipo de Mídia Favorito */}
            {profileExtras.favoriteType && (
              <View style={styles.favTypeRow}>
                <Text style={[styles.favTypeLabel, { color: colors.textSecondary }]}>
                  Gênero predileto:
                </Text>
                <View
                  style={[
                    styles.favTypeBadge,
                    {
                      backgroundColor: 'rgba(0, 184, 212, 0.15)',
                      borderColor: 'rgba(0, 184, 212, 0.3)',
                    },
                  ]}
                >
                  <Text style={[styles.favTypeBadgeText, { color: colors.primary }]}>
                    {TYPE_LABELS[profileExtras.favoriteType] || profileExtras.favoriteType}
                  </Text>
                </View>
              </View>
            )}

            {/* Mídia Favorita */}
            {favoriteItem && (
              <TouchableOpacity
                style={[
                  styles.favItemBox,
                  {
                    backgroundColor: colors.backgroundTertiary,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Detalhes', { id: favoriteItem.id })}
              >
                {catalogImages[favoriteItem.id] ? (
                  <Image
                    source={catalogImages[favoriteItem.id]}
                    style={styles.favItemCover}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.favItemCover,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  />
                )}
                <View style={styles.favItemInfo}>
                  <Text style={[styles.favItemTag, { color: colors.primary }]}>
                    Mídia Favorita
                  </Text>
                  <Text
                    style={[styles.favItemTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {favoriteItem.title}
                  </Text>
                  <Text style={[styles.favItemMeta, { color: colors.textMuted }]}>
                    {favoriteItem.year} • {TYPE_LABELS[favoriteItem.type] || favoriteItem.type}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Atalho para Configurações */}
        <TouchableOpacity
          style={[
            styles.settingsShortcut,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
          onPress={() => navigation.navigate('Configuracoes')}
          activeOpacity={0.7}
        >
          <View style={styles.settingsShortcutLeft}>
            <Text style={styles.settingsShortcutIcon}>⚙️</Text>
            <View>
              <Text style={[styles.settingsShortcutTitle, { color: colors.text }]}>
                Configurações da Conta
              </Text>
              <Text style={[styles.settingsShortcutSubtitle, { color: colors.textSecondary }]}>
                Editar foto, tema, favoritos, dados e senha
              </Text>
            </View>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>

        {/* Seção de Avaliações do Usuário */}
        <View style={styles.ratingsSection}>
          <View style={styles.ratingsHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Minhas Avaliações
            </Text>
            {userRatings.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                  {userRatings.length}
                </Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                Carregando avaliações...
              </Text>
            </View>
          ) : userRatings.length === 0 ? (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Você ainda não avaliou nada
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Navegue pelo catálogo e avalie filmes, séries, músicas e documentários para vê-los aqui!
              </Text>
              <TouchableOpacity
                style={[
                  styles.exploreButton,
                  {
                    backgroundColor: colors.backgroundTertiary,
                    borderColor: colors.borderLight,
                  },
                ]}
                onPress={() => navigation.navigate('Catálogo')}
                activeOpacity={0.8}
              >
                <Text style={[styles.exploreButtonText, { color: colors.text }]}>
                  Explorar Catálogo
                </Text>
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
                    style={[
                      styles.ratingCard,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('Detalhes', { id: review.itemId })
                    }
                  >
                    <View style={styles.itemRow}>
                      {item.image ? (
                        <Image
                          source={item.image}
                          style={[
                            styles.itemCover,
                            { backgroundColor: colors.backgroundTertiary },
                          ]}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.itemPlaceholder,
                            { backgroundColor: colors.backgroundTertiary },
                          ]}
                        >
                          <Text style={styles.itemPlaceholderEmoji}>🎬</Text>
                        </View>
                      )}

                      <View style={styles.itemDetails}>
                        <View style={styles.itemMetaRow}>
                          {item.type ? (
                            <View style={styles.typeBadge}>
                              <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                                {TYPE_LABELS[item.type] || item.type}
                              </Text>
                            </View>
                          ) : null}
                          {item.year ? (
                            <Text style={[styles.itemYear, { color: colors.textMuted }]}>
                              • {item.year}
                            </Text>
                          ) : null}
                        </View>

                        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>

                        {/* Estrelas da Avaliação */}
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Text
                              key={s}
                              style={[
                                styles.starIcon,
                                {
                                  color:
                                    s <= review.rating
                                      ? colors.star
                                      : colors.starInactive,
                                },
                              ]}
                            >
                              ★
                            </Text>
                          ))}
                          <Text style={[styles.ratingScore, { color: colors.text }]}>
                            {review.rating}/5
                          </Text>
                          {review.date ? (
                            <Text style={[styles.reviewDate, { color: colors.textMuted }]}>
                              • {formatReviewDate(review.date)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                    </View>

                    {/* Comentário (se houver) */}
                    {hasComment && (
                      <View style={[styles.commentBox, { borderTopColor: colors.border }]}>
                        <Text style={[styles.commentText, { color: colors.textSecondary }]}>
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
            style={[
              styles.logoutButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: 'rgba(255, 77, 77, 0.35)',
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.logoutButtonText, { color: colors.danger }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  settingsHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 12,
  },
  settingsHeaderIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 36,
  },
  profileCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 184, 212, 0.2)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    justifyContent: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  preferencesCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  preferencesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferencesTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  editPreferencesText: {
    fontSize: 13,
    fontWeight: '700',
  },
  favTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  favTypeLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8,
  },
  favTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  favTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  favItemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
  },
  favItemCover: {
    width: 40,
    height: 52,
    borderRadius: 6,
  },
  favItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  favItemTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  favItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  favItemMeta: {
    fontSize: 11,
  },
  settingsShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  settingsShortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsShortcutIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  settingsShortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingsShortcutSubtitle: {
    fontSize: 12,
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
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 184, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 212, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  exploreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  exploreButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  ratingsList: {
    gap: 0,
  },
  ratingCard: {
    borderRadius: 16,
    borderWidth: 1,
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
  },
  itemPlaceholder: {
    width: 50,
    height: 68,
    borderRadius: 8,
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
    backgroundColor: 'rgba(0, 184, 212, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemYear: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
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
  ratingScore: {
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 11,
    marginLeft: 4,
  },
  chevron: {
    fontSize: 24,
    marginLeft: 6,
  },
  commentBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  commentText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  logoutContainer: {
    marginTop: 8,
  },
  logoutButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});

