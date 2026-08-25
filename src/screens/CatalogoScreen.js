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
import catalog from '../data/catalog.json';
import { catalogImages } from '../data/images';
import colors from '../styles/theme';

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

  const filtroTipo = CATEGORIAS.find((c) => c.label === categoriaAtiva)?.type;

  const itensFiltrados = filtroTipo
    ? catalog.filter((item) => item.type === filtroTipo)
    : catalog;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo</Text>
        <Text style={styles.headerSubtitle}>Explore itens para avaliar e descobrir</Text>
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
                  isSelected && styles.chipAtivo,
                ]}
                onPress={() => setCategoriaAtiva(item.label)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
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
              style={styles.card}
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
                <View style={styles.capa} />
              )}
              <View style={styles.cardInfo}>
                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardCategoria}>
                    {TYPE_LABELS[item.type] || item.type}
                  </Text>
                  <Text style={styles.cardYear}>• {item.year}</Text>
                </View>
                <Text style={styles.cardTitulo} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardDescricao} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextAtivo: {
    color: colors.text,
    fontWeight: '700',
  },
  lista: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  capa: {
    width: 60,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.backgroundTertiary,
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
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardYear: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardTitulo: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescricao: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  chevron: {
    fontSize: 26,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
