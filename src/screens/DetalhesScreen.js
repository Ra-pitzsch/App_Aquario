import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getItemById } from '../services/catalogService';
import { getAverageRating, getRatingsWithUserDetails } from '../utils/ratings';
import CustomButton from '../components/CustomButton';

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

function Estrelas({ nota = 0, total = 0 }) {
  const cheias = Math.round(nota);
  const { colors } = useTheme();

  return (
    <View style={styles.starsContainer}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text
            key={i}
            style={[
              styles.star,
              { color: i <= cheias && nota > 0 ? colors.star : colors.starInactive },
            ]}
          >
            {i <= cheias && nota > 0 ? '★' : '☆'}
          </Text>
        ))}
      </View>
      <Text style={[styles.notaValue, { color: colors.text }]}>
        {nota > 0 ? nota.toFixed(1) : 'Sem avaliações'}
      </Text>
      <Text style={[styles.notaLabel, { color: colors.textMuted }]}>
        {total > 0
          ? `/ 5.0 (${total} ${total === 1 ? 'avaliação' : 'avaliações'})`
          : ''}
      </Text>
    </View>
  );
}

export default function DetalhesScreen({ route, navigation }) {
  const { id } = route?.params || {};
  const [ratingStats, setRatingStats] = useState({ average: 0, total: 0 });
  const [ratingsList, setRatingsList] = useState([]);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const item = useMemo(() => getItemById(id), [id]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchRatingsData() {
        if (id) {
          try {
            const [stats, reviews] = await Promise.all([
              getAverageRating({ itemId: id }),
              getRatingsWithUserDetails({ itemId: id }),
            ]);
            if (isActive) {
              setRatingStats(stats);
              setRatingsList(reviews);
            }
          } catch (error) {
            console.error('Erro ao buscar avaliações na tela de detalhes:', error);
          }
        }
      }

      fetchRatingsData();

      return () => {
        isActive = false;
      };
    }, [id])
  );

  const handleAvaliar = () => {
    navigation.navigate('Avaliar', { id: item?.id, title: item?.title });
  };

  if (!item) {
    return (
      <View
        style={[
          styles.errorContainer,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top > 0 ? insets.top + 20 : 24,
          },
        ]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorEmoji}>🔍</Text>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Item não encontrado</Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
          Não foi possível carregar as informações deste item.
        </Text>
        <TouchableOpacity
          style={[
            styles.backLink,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backLinkText, { color: colors.primary }]}>Voltar ao catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header Superior com Botão de Voltar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top > 0 ? insets.top + 8 : 12,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detalhes</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Capa / Imagem Grande */}
        <View style={[styles.coverWrapper, { shadowColor: colors.primary }]}>
          {item.image ? (
            <Image
              source={item.image}
              style={[styles.coverImage, { backgroundColor: colors.backgroundSecondary }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.coverPlaceholder,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.coverPlaceholderEmoji}>🎬</Text>
            </View>
          )}
        </View>

        {/* Informações Principais */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                {TYPE_LABELS[item.type] || item.type}
              </Text>
            </View>
            <Text style={[styles.yearText, { color: colors.textMuted }]}>{item.year}</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>

          {/* Nota Média Dinâmica */}
          <Estrelas nota={ratingStats.average} total={ratingStats.total} />

          {/* Divisor */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Sinopse / Descrição */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sinopse</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>

          {/* Ação de Avaliar */}
          <View style={styles.actionContainer}>
            <CustomButton
              title="★ Avaliar este Item"
              onPress={handleAvaliar}
            />
          </View>
        </View>

        {/* Seção de Avaliações e Comentários */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeaderRow}>
            <Text style={[styles.reviewsSectionTitle, { color: colors.text }]}>Avaliações</Text>
            {ratingsList.length > 0 && (
              <View style={styles.reviewsCountBadge}>
                <Text style={[styles.reviewsCountBadgeText, { color: colors.primary }]}>
                  {ratingsList.length}
                </Text>
              </View>
            )}
          </View>

          {ratingsList.length === 0 ? (
            <View
              style={[
                styles.emptyReviewsBox,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.emptyReviewsEmoji}>💬</Text>
              <Text style={[styles.emptyReviewsTitle, { color: colors.text }]}>
                Nenhuma avaliação ainda
              </Text>
              <Text style={[styles.emptyReviewsSubtitle, { color: colors.textSecondary }]}>
                Seja o primeiro a avaliar este item!
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {ratingsList.map((review, index) => {
                const rawComment =
                  typeof review.comment === 'string' ? review.comment.trim() : '';
                const cleanComment = rawComment.replace(/^["'“”«»]+|["'“”«»]+$/g, '').trim();
                const hasComment = cleanComment.length > 0;

                return (
                  <View
                    key={review.userId || index}
                    style={[
                      styles.reviewCard,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                      index === ratingsList.length - 1 && styles.reviewCardLast,
                    ]}
                  >
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUserGroup}>
                        <View
                          style={[
                            styles.avatar,
                            {
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          <Text style={[styles.avatarText, { color: colors.primary }]}>
                            {review.userName
                              ? review.userName.charAt(0).toUpperCase()
                              : '👤'}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.reviewUserName, { color: colors.text }]}>
                            {review.userName || 'Usuário'}
                          </Text>
                          {review.date ? (
                            <Text style={[styles.reviewDate, { color: colors.textMuted }]}>
                              {formatReviewDate(review.date)}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.reviewStarsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Text
                            key={s}
                            style={[
                              styles.reviewStarIcon,
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
                      </View>
                    </View>

                    {hasComment && (
                      <View style={[styles.commentBox, { borderTopColor: colors.border }]}>
                        <Text style={[styles.commentText, { color: colors.textSecondary }]}>
                          {`"${cleanComment}"`}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
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
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
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
  coverWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: 280,
    borderRadius: 18,
  },
  coverPlaceholder: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderEmoji: {
    fontSize: 54,
  },
  infoCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 184, 212, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 212, 0.3)',
    marginRight: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  notaValue: {
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 4,
  },
  notaLabel: {
    fontSize: 13,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  backLinkText: {
    fontWeight: '700',
    fontSize: 14,
  },
  reviewsSection: {
    marginTop: 24,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  reviewsCountBadge: {
    backgroundColor: 'rgba(0, 184, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 212, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  reviewsCountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyReviewsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviewsEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyReviewsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyReviewsSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  reviewsList: {
    gap: 0,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reviewCardLast: {
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUserGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 184, 212, 0.2)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewStarIcon: {
    fontSize: 14,
    marginLeft: 1,
  },
  commentBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
