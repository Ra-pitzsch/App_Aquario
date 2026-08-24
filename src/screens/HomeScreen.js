import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import catalog from '../data/catalog.json';
import { catalogImages } from '../data/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Ícones/badges por tipo de mídia
const TYPE_CONFIG = {
  filme: { label: 'Filme', emoji: '🎬', color: '#E63950' },
  serie: { label: 'Série', emoji: '📺', color: '#FF7B00' },
  musica: { label: 'Música', emoji: '🎵', color: '#9D4EDD' },
  documentario: { label: 'Doc', emoji: '🏔️', color: '#00B4D8' },
};

// Posições orgânicas espalhadas pelo "aquário"
const POSITIONS = [
  { top: '3%', left: '6%', size: 'large' },
  { top: '8%', right: '8%', size: 'medium' },
  { top: '33%', left: '8%', size: 'medium' },
  { top: '36%', right: '6%', size: 'large' },
  { top: '63%', left: '10%', size: 'large' },
  { top: '65%', right: '10%', size: 'medium' },
  { top: '22%', left: '38%', size: 'small' },
  { top: '50%', left: '36%', size: 'small' },
];

/**
 * Bolha sutil animada para o fundo do aquário
 */
function AmbientBubble({ startX, size, duration, delay }) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -50,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.35,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.35,
              duration: duration * 0.6,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: startX,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

/**
 * Card flutuante individual do item no aquário
 */
function FloatingItem({ item, position, index, navigation }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parâmetros de timing e distância assíncronos para movimento natural
    const durationY = 2600 + (index % 4) * 450;
    const durationX = 3200 + (index % 3) * 550;
    const distanceY = 10 + (index % 3) * 3;
    const distanceX = 5 + (index % 2) * 3;
    const initialDelay = (index * 200) % 900;

    const animY = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -distanceY,
          duration: durationY,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: distanceY,
          duration: durationY,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: durationY * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const animX = Animated.loop(
      Animated.sequence([
        Animated.timing(floatX, {
          toValue: distanceX,
          duration: durationX,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatX, {
          toValue: -distanceX,
          duration: durationX,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatX, {
          toValue: 0,
          duration: durationX * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      animY.start();
      animX.start();
    }, initialDelay);

    return () => {
      clearTimeout(timer);
      animY.stop();
      animX.stop();
    };
  }, []);

  const imageSource = catalogImages[item.id];
  const typeInfo = TYPE_CONFIG[item.type] || {
    label: item.type,
    emoji: '🎬',
    color: '#E63950',
  };

  const isLarge = position.size === 'large';
  const isSmall = position.size === 'small';

  const cardWidth = isLarge ? 140 : isSmall ? 105 : 125;
  const cardHeight = isLarge ? 180 : isSmall ? 135 : 160;

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          top: position.top,
          left: position.left,
          right: position.right,
          transform: [{ translateY: floatY }, { translateX: floatX }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.itemCard,
          { width: cardWidth, height: cardHeight },
        ]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Detalhes', { id: item.id })}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>{typeInfo.emoji}</Text>
          </View>
        )}

        {/* Gradiente escuro sobre a imagem para leitura do título */}
        <View style={styles.overlayGradient} />

        {/* Badge do Tipo */}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: 'rgba(10, 18, 30, 0.85)', borderColor: typeInfo.color },
          ]}
        >
          <Text style={styles.typeEmoji}>{typeInfo.emoji}</Text>
          <Text style={[styles.typeText, { color: typeInfo.color }]}>
            {typeInfo.label}
          </Text>
        </View>

        {/* Título e Ano na base */}
        <View style={styles.itemBottomInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemYear}>{item.year}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  // Limita os itens a exibir para garantir leveza e estética limpa
  const itemsToDisplay = catalog.slice(0, 8);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Bolhas sutis de ambiente */}
      <AmbientBubble startX={SCREEN_WIDTH * 0.15} size={14} duration={7000} delay={0} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.45} size={8} duration={8500} delay={1500} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.75} size={18} duration={6500} delay={3000} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.88} size={10} duration={9000} delay={800} />

      {/* Header Superior do Aquário */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>🐠 RECOMENDAÇÕES VIVAS</Text>
        </View>
        <Text style={styles.headerTitle}>Aquário</Text>
        <Text style={styles.headerSubtitle}>
          Toque em uma mídia para ver detalhes e avaliar
        </Text>
      </View>

      {/* Espaço do Aquário com itens flutuando */}
      <View style={styles.aquariumArea}>
        {itemsToDisplay.map((item, index) => {
          const position = POSITIONS[index % POSITIONS.length];
          return (
            <FloatingItem
              key={item.id}
              item={item}
              position={position}
              index={index}
              navigation={navigation}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B', // Fundo azul profundo de aquário
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  headerBadgeText: {
    color: '#00B4D8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E9AAF',
    marginTop: 2,
  },
  aquariumArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  floatingContainer: {
    position: 'absolute',
    zIndex: 5,
  },
  itemCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111D38',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 180, 216, 0.3)',
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C2541',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 19, 43, 0.45)',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeEmoji: {
    fontSize: 9,
    marginRight: 3,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemBottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(11, 19, 43, 0.88)',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemYear: {
    fontSize: 10,
    color: '#8E9AAF',
    marginTop: 1,
    fontWeight: '600',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(144, 224, 239, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 1,
  },
});
