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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const { colors } = useTheme();

  const typeConfig = {
    filme: { label: 'Filme', color: colors.primary },
    serie: { label: 'Série', color: '#38BDF8' },
    musica: { label: 'Música', color: colors.accent },
    documentario: { label: 'Doc', color: '#2DD4BF' },
  };

  useEffect(() => {
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
  const typeInfo = typeConfig[item.type] || {
    label: item.type,
    color: colors.primary,
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
          {
            width: cardWidth,
            height: cardHeight,
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.borderLight,
            shadowColor: colors.primary,
          },
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
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              {typeInfo.label}
            </Text>
          </View>
        )}

        <View style={styles.overlayGradient} />

        <View
          style={[
            styles.typeBadge,
            { backgroundColor: colors.backgroundSecondary, borderColor: typeInfo.color },
          ]}
        >
          <Text style={[styles.typeText, { color: typeInfo.color }]}>
            {typeInfo.label}
          </Text>
        </View>

        <View
          style={[
            styles.itemBottomInfo,
            { backgroundColor: colors.backgroundSecondary + 'EA' },
          ]}
        >
          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.itemYear, { color: colors.textSecondary }]}>{item.year}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const itemsToDisplay = catalog.slice(0, 8);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Bolhas sutis de ambiente */}
      <AmbientBubble startX={SCREEN_WIDTH * 0.15} size={14} duration={7000} delay={0} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.45} size={8} duration={8500} delay={1500} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.75} size={18} duration={6500} delay={3000} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.88} size={10} duration={9000} delay={800} />

      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Aquário</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Toque em uma mídia para ver detalhes e avaliar
        </Text>
      </View>

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
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 12,
    zIndex: 10,
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
    borderWidth: 1.5,
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 26, 43, 0.25)',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemBottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemYear: {
    fontSize: 10,
    marginTop: 1,
    fontWeight: '600',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(77, 208, 225, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
});
