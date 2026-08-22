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
import { getAverageRating } from '../utils/ratings';
import CustomButton from '../components/CustomButton';

const TYPE_LABELS = {
  filme: 'Filme',
  serie: 'Série',
  musica: 'Música',
  documentario: 'Documentário',
};

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

  // Busca isolada do item via service
  const item = useMemo(() => getItemById(id), [id]);

  // Recarrega as avaliações sempre que a tela entra em foco (ex: ao voltar da tela Avaliar)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchRating() {
        if (id) {
          const stats = await getAverageRating({ itemId: id });
          if (isActive) {
            setRatingStats(stats);
          }
        }
      }

      fetchRating();

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
        <StatusBar barStyle="light-content" backgroundColor="#141218" />
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
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

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
  coverWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    backgroundColor: '#1E1B24',
  },
  coverPlaceholder: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    backgroundColor: '#1E1B24',
    borderWidth: 1,
    borderColor: '#2A2733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderEmoji: {
    fontSize: 54,
  },
  infoCard: {
    backgroundColor: '#1E1B24',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: 'rgba(230, 57, 80, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 80, 0.3)',
    marginRight: 10,
  },
  typeBadgeText: {
    color: '#E63950',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yearText: {
    color: '#8A8794',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
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
    color: '#F5B400',
    fontSize: 16,
    marginRight: 2,
  },
  notaValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 4,
  },
  notaLabel: {
    color: '#8A8794',
    fontSize: 13,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2733',
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  description: {
    color: '#C7C4D0',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#141218',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#8A8794',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1E1B24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  backLinkText: {
    color: '#E63950',
    fontWeight: '700',
    fontSize: 14,
  },
});
