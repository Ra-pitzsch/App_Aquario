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
import { getItemById } from '../services/catalogService';
import { getAverageRating, getRatingsWithUserDetails } from '../utils/ratings';
import CustomButton from '../components/CustomButton';
import colors from '../styles/theme';

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
  return (
    <View style={styles.starsContainer}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={styles.star}>
            {i <= cheias && nota > 0 ? '★' : '☆'}
          </Text>
        ))}
      </View>
      <Text style={styles.notaValue}>
        {nota > 0 ? nota.toFixed(1) : 'Sem avaliações'}
      </Text>
      <Text style={styles.notaLabel}>
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
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Text style={styles.errorEmoji}>🔍</Text>
        <Text style={styles.errorTitle}>Item não encontrado</Text>
        <Text style={styles.errorSubtitle}>
          Não foi possível carregar as informações deste item.
        </Text>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>Voltar ao catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header Superior com Botão de Voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Capa / Imagem Grande */}
        <View style={styles.coverWrapper}>
          {item.image ? (
            <Image
              source={item.image}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderEmoji}>🎬</Text>
            </View>
          )}
        </View>

        {/* Informações Principais */}
        <View style={styles.infoCard}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {TYPE_LABELS[item.type] || item.type}
              </Text>
            </View>
            <Text style={styles.yearText}>{item.year}</Text>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          {/* Nota Média Dinâmica */}
          <Estrelas nota={ratingStats.average} total={ratingStats.total} />

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Sinopse / Descrição */}
          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.description}>{item.description}</Text>

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
            <Text style={styles.reviewsSectionTitle}>Avaliações</Text>
            {ratingsList.length > 0 && (
              <View style={styles.reviewsCountBadge}>
                <Text style={styles.reviewsCountBadgeText}>
                  {ratingsList.length}
                </Text>
              </View>
            )}
          </View>

          {ratingsList.length === 0 ? (
            <View style={styles.emptyReviewsBox}>
              <Text style={styles.emptyReviewsEmoji}>💬</Text>
              <Text style={styles.emptyReviewsTitle}>
                Nenhuma avaliação ainda
              </Text>
              <Text style={styles.emptyReviewsSubtitle}>
                Seja o primeiro a avaliar este item!
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {ratingsList.map((review, index) => {
                const hasComment =
                  typeof review.comment === 'string' &&
                  review.comment.trim().length > 0;

                return (
                  <View
                    key={review.userId || index}
                    style={[
                      styles.reviewCard,
                      index === ratingsList.length - 1 && styles.reviewCardLast,
                    ]}
                  >
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUserGroup}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {review.userName
                              ? review.userName.charAt(0).toUpperCase()
                              : '👤'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reviewUserName}>
                            {review.userName || 'Usuário'}
                          </Text>
                          {review.date ? (
                            <Text style={styles.reviewDate}>
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
                              s <= review.rating
                                ? styles.reviewStarFilled
                                : styles.reviewStarEmpty,
                            ]}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                    </View>

                    {hasComment && (
                      <View style={styles.commentBox}>
                        <Text style={styles.commentText}>
                          {review.comment.trim()}
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.text,
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
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
  },
  coverPlaceholder: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderEmoji: {
    fontSize: 54,
  },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yearText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
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
    color: colors.star,
    fontSize: 16,
    marginRight: 2,
  },
  notaValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 4,
  },
  notaLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backLinkText: {
    color: colors.primary,
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
    color: colors.text,
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
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyReviewsBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviewsEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyReviewsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyReviewsSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  reviewsList: {
    gap: 0,
  },
  reviewCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  reviewUserName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewDate: {
    color: colors.textMuted,
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
  reviewStarFilled: {
    color: colors.star,
  },
  reviewStarEmpty: {
    color: colors.starInactive,
  },
  commentBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
