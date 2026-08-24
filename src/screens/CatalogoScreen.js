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
import { useAuth } from '../context/AuthContext';
import catalog from '../data/catalog.json';
import { catalogImages } from '../data/images';

const CATEGORIAS = [
  { label: 'Todos', type: null },
  { label: 'Filmes', type: 'filme' },
  { label: 'Séries', type: 'serie' },
  { label: 'Músicas', type: 'musica' },
  { label: 'Docs', type: 'documentario' },
];

const TYPE_LABELS = {
  filme: 'Filme',
  serie: 'Série',
  musica: 'Música',
  documentario: 'Documentário',
};

export default function CatalogoScreen({ navigation }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const { user } = useAuth();

  const filtroTipo = CATEGORIAS.find((c) => c.label === categoriaAtiva)?.type;

  const itensFiltrados = filtroTipo
    ? catalog.filter((item) => item.type === filtroTipo)
    : catalog;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.greetingRow}
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.7}
          >
            <View style={styles.miniAvatar}>
              <Text style={styles.miniAvatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </Text>
            </View>
            <Text style={styles.userGreeting}>
              Olá, {user?.name || 'Usuário'} 👋
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Catálogo</Text>
        <Text style={styles.headerSubtitle}>Explore itens para avaliar e descobrir</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        {CATEGORIAS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.chip,
              categoriaAtiva === item.label && styles.chipAtivo,
            ]}
            onPress={() => setCategoriaAtiva(item.label)}
          >
            <Text
              style={[
                styles.chipText,
                categoriaAtiva === item.label && styles.chipTextAtivo,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
    backgroundColor: '#141218',
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(230, 57, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 80, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  miniAvatarText: {
    color: '#E63950',
    fontSize: 12,
    fontWeight: '700',
  },
  userGreeting: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#A9A6B2',
    marginTop: 2,
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: 14,
  },
  chipsRow: {
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1E1B24',
    borderWidth: 1,
    borderColor: '#2A2733',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAtivo: {
    backgroundColor: '#E63950',
    borderColor: '#E63950',
  },
  chipText: {
    color: '#C7C4D0',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextAtivo: {
    color: '#FFFFFF',
  },
  lista: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B24',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  capa: {
    width: 60,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#2A2733',
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
    color: '#E63950',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardYear: {
    fontSize: 11,
    color: '#8A8794',
    fontWeight: '600',
    marginLeft: 4,
  },
  cardTitulo: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescricao: {
    fontSize: 12,
    color: '#A9A6B2',
    lineHeight: 16,
  },
  chevron: {
    fontSize: 26,
    color: '#4C4956',
    marginLeft: 8,
  },
});
