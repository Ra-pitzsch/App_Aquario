import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getItemById } from '../services/catalogService';
import { saveRating, getRatingByUser } from '../utils/ratings';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const RATING_LABELS = {
  1: '1 de 5 • Ruim 🙁',
  2: '2 de 5 • Regular 😐',
  3: '3 de 5 • Bom 🙂',
  4: '4 de 5 • Muito Bom! 😊',
  5: '5 de 5 • Excelente! 🤩',
};

const TYPE_LABELS = {
  filme: 'Filme',
  serie: 'Série',
  musica: 'Música',
  documentario: 'Documentário',
};

export default function AvaliarScreen({ route, navigation }) {
  const { id } = route?.params || {};
  const { user } = useAuth();

  const item = useMemo(() => getItemById(id), [id]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loadingRating, setLoadingRating] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Carrega avaliação prévia do usuário, se houver
  useEffect(() => {
    async function loadExistingRating() {
      if (!user?.id || !id) {
        setLoadingRating(false);
        return;
      }

      try {
        const existing = await getRatingByUser({ userId: user.id, itemId: id });
        if (existing) {
          setRating(existing.rating || 0);
          setComment(existing.comment || '');
          setIsUpdating(true);
        }
      } catch (error) {
        console.error('Erro ao carregar avaliação existente:', error);
      } finally {
        setLoadingRating(false);
      }
    }

    loadExistingRating();
  }, [user?.id, id]);

  const handleSave = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert(
        'Nota obrigatória',
        'Por favor, selecione uma nota de 1 a 5 estrelas para continuar.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      setSaving(true);
      await saveRating({
        userId: user.id,
        itemId: id,
        rating,
        comment,
      });

      Alert.alert(
        'Sucesso!',
        isUpdating
          ? 'Sua avaliação foi atualizada com sucesso!'
          : 'Sua avaliação foi salva com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar a avaliação.');
    } finally {
      setSaving(false);
    }
  };

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#141218" />
        <Text style={styles.errorEmoji}>🔍</Text>
        <Text style={styles.errorTitle}>Item não encontrado</Text>
        <Text style={styles.errorSubtitle}>
          Não foi possível identificar o item para avaliar.
        </Text>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
        <Text style={styles.headerTitle}>Avaliar Item</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Card do Item Resumido */}
        <View style={styles.itemCard}>
          {item.image ? (
            <Image
              source={item.image}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.itemPlaceholder}>
              <Text style={styles.itemPlaceholderEmoji}>🎬</Text>
            </View>
          )}

          <View style={styles.itemInfo}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {TYPE_LABELS[item.type] || item.type}
              </Text>
            </View>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.itemYear}>{item.year}</Text>
          </View>
        </View>

        {loadingRating ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#E63950" />
            <Text style={styles.loadingText}>Carregando avaliação...</Text>
          </View>
        ) : (
          <View style={styles.formCard}>
            {isUpdating && (
              <View style={styles.updatingNotice}>
                <Text style={styles.updatingNoticeText}>
                  ✏️ Você já avaliou este item. Edite sua nota ou comentário se desejar.
                </Text>
              </View>
            )}

            {/* Seletor de Estrelas */}
            <Text style={styles.sectionLabel}>Sua Nota *</Text>
            <View style={styles.starsContainer}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = starValue <= rating;
                  return (
                    <TouchableOpacity
                      key={starValue}
                      style={styles.starTouch}
                      activeOpacity={0.7}
                      onPress={() => setRating(starValue)}
                    >
                      <Text
                        style={[
                          styles.starIcon,
                          isFilled ? styles.starFilled : styles.starEmpty,
                        ]}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.ratingFeedback}>
                {rating > 0
                  ? RATING_LABELS[rating]
                  : 'Toque nas estrelas para selecionar uma nota'}
              </Text>
            </View>

            {/* Campo de Comentário */}
            <View style={styles.commentSection}>
              <View style={styles.commentHeader}>
                <Text style={styles.sectionLabel}>Comentário</Text>
                <Text style={styles.optionalBadge}>Opcional</Text>
              </View>

              <CustomInput
                placeholder="O que você achou? Escreva suas impressões..."
                value={comment}
                onChangeText={setComment}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* Botão de Ação */}
            <View style={styles.buttonContainer}>
              <CustomButton
                title={saving ? 'Salvando...' : isUpdating ? 'Atualizar Avaliação' : 'Salvar Avaliação'}
                onPress={handleSave}
                loading={saving}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B24',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  itemImage: {
    width: 60,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#2A2733',
  },
  itemPlaceholder: {
    width: 60,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#2A2733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPlaceholderEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(230, 57, 80, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 80, 0.3)',
    marginBottom: 4,
  },
  typeBadgeText: {
    color: '#E63950',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  itemYear: {
    fontSize: 12,
    color: '#8A8794',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#1E1B24',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  updatingNotice: {
    backgroundColor: 'rgba(245, 180, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 180, 0, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
  },
  updatingNoticeText: {
    color: '#F5B400',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  starsContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#141218',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2733',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  starTouch: {
    padding: 8,
  },
  starIcon: {
    fontSize: 38,
  },
  starFilled: {
    color: '#F5B400',
  },
  starEmpty: {
    color: '#34313D',
  },
  ratingFeedback: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A9A6B2',
  },
  commentSection: {
    marginTop: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionalBadge: {
    fontSize: 11,
    color: '#8A8794',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    marginTop: 8,
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
