import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

const CATEGORIAS = ['Todos', 'Filmes', 'Séries', 'Músicas', 'Docs'];

// Sem imagem por enquanto — cada card mostra um bloco cinza no lugar
// da capa. Quando quiser adicionar fotos, veja COMO-COLOCAR-AS-FOTOS.md
const ITENS = [
  {
    id: '1',
    titulo: 'Duna: Parte Dois',
    categoria: 'Filmes',
    nota: 4.8,
  },
  {
    id: '2',
    titulo: 'Breaking Bad',
    categoria: 'Séries',
    nota: 4.9,
  },
  {
    id: '3',
    titulo: 'Blinding Lights',
    categoria: 'Músicas',
    nota: 4.5,
  },
  {
    id: '4',
    titulo: 'Free Solo',
    categoria: 'Docs',
    nota: 4.7,
  },
  {
    id: '5',
    titulo: 'Oppenheimer',
    categoria: 'Filmes',
    nota: 4.6,
  },
  {
    id: '6',
    titulo: 'Stranger Things',
    categoria: 'Séries',
    nota: 4.4,
  },
];

function Estrelas({ nota }) {
  const cheias = Math.round(nota);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={styles.star}>
          {i <= cheias ? '★' : '☆'}
        </Text>
      ))}
      <Text style={styles.notaText}>{nota.toFixed(1)}</Text>
    </View>
  );
}

export default function ListScreen({ navigation }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  const itensFiltrados =
    categoriaAtiva === 'Todos'
      ? ITENS
      : ITENS.filter((item) => item.categoria === categoriaAtiva);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#141218" />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation && navigation.navigate('Login')}
          >
            <Text style={styles.backButtonText}>‹ Voltar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Aquário</Text>
        <Text style={styles.headerSubtitle}>O que você quer avaliar hoje?</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        {CATEGORIAS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              categoriaAtiva === item && styles.chipAtivo,
            ]}
            onPress={() => setCategoriaAtiva(item)}
          >
            <Text
              style={[
                styles.chipText,
                categoriaAtiva === item && styles.chipTextAtivo,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.capa} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardCategoria}>{item.categoria}</Text>
              <Text style={styles.cardTitulo}>{item.titulo}</Text>
              <Estrelas nota={item.nota} />
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
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
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  backButtonText: {
    color: '#A9A6B2',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
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
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  capa: {
    width: 56,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#2A2733',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardCategoria: {
    fontSize: 11,
    color: '#E63950',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  cardTitulo: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#F5B400',
    fontSize: 13,
    marginRight: 1,
  },
  notaText: {
    color: '#A9A6B2',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 26,
    color: '#4C4956',
    marginLeft: 4,
  },
});