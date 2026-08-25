import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import catalog from '../data/catalog.json';
import { catalogImages } from '../data/images';

const CATEGORIAS = [
  { label: 'Todos', type: null },
  { label: 'Filmes', type: 'filme' },
  { label: 'Séries', type: 'serie' },
  { label: 'Músicas', type: 'musica' },
  { label: 'Documentários', type: 'documentario' },
];

const TYPE_LABELS = {
  filme: 'Filme',
  serie: 'Série',
  musica: 'Música',
  documentario: 'Documentário',
};

export default function CatalogoScreen({ navigation }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const filtroTipo = CATEGORIAS.find((c) => c.label === categoriaAtiva)?.type;

  const itensFiltrados = filtroTipo
    ? catalog.filter((item) => item.type === filtroTipo)
    : catalog;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Catálogo</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Explore itens para avaliar e descobrir
        </Text>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {CATEGORIAS.map((item) => {
            const isSelected = categoriaAtiva === item.label;
            return (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setCategoriaAtiva(item.label)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    isSelected && styles.chipTextAtivo,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const imageSource = catalogImages[item.id];

          return (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Detalhes', { id: item.id })}
            >
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={styles.capa}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.capa, { backgroundColor: colors.backgroundTertiary }]} />
              )}
              <View style={styles.cardInfo}>
                <View style={styles.cardMetaRow}>
                  <Text style={[styles.cardCategoria, { color: colors.primary }]}>
                    {TYPE_LABELS[item.type] || item.type}
                  </Text>
                  <Text style={[styles.cardYear, { color: colors.textMuted }]}>• {item.year}</Text>
                </View>
                <Text style={[styles.cardTitulo, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.cardDescricao, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 14,
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
  filterWrapper: {
    marginBottom: 14,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    paddingLeft: 22,
    paddingRight: 14,
    alignItems: 'center',
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextAtivo: {
    fontWeight: '700',
  },
  lista: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  capa: {
    width: 60,
    height: 80,
    borderRadius: 10,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardCategoria: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardYear: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescricao: {
    fontSize: 12,
    lineHeight: 16,
  },
  chevron: {
    fontSize: 26,
    marginLeft: 8,
  },
});
