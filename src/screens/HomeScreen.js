import React, { useEffect, useRef, useMemo } from 'react';
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
import { fishImages } from '../data/fishImages';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Posições orgânicas espalhadas pelo "aquário"
const POSITIONS = [
  { top: '4%', left: '8%' },
  { top: '9%', right: '8%' },
  { top: '27%', left: '8%' },
  { top: '30%', right: '8%' },
  { top: '54%', left: '8%' },
  { top: '58%', right: '10%' },
  { top: '17%', left: '38%' },
  { top: '42%', left: '36%' },
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
 * Peixe flutuante individual representando um item no aquário
 */
function FloatingItem({ item, position, index, navigation }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  useEffect(() => {
    const durationY = 2600 + (index % 4) * 450;
    const durationX = 3200 + (index % 3) * 550;
    const distanceY = 10 + (index % 3) * 3;
    const distanceX = 6 + (index % 2) * 4;
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
        style={styles.touchableArea}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Detalhes', { id: item.id })}
      >
        {/* Bolha com o peixe ilustrado */}
        <View
          style={[
            styles.fishCard,
            {
              borderColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Image
            source={item.fishImage}
            style={styles.fishImage}
            resizeMode="contain"
          />
        </View>

        {/* Título do item abaixo do peixe */}
        <View
          style={[
            styles.titleBadge,
            {
              backgroundColor: 'rgba(7, 26, 43, 0.88)',
              borderColor: 'rgba(0, 184, 212, 0.45)',
            },
          ]}
        >
          <Text
            style={[styles.itemTitle, { color: '#FFFFFF' }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Sorteia 8 itens do catálogo e atribui uma imagem de peixe para cada um
  const itemsToDisplay = useMemo(() => {
    const shuffled = [...catalog].sort(() => 0.5 - Math.random());
    const subset = shuffled.slice(0, 8);
    return subset.map((item, index) => {
      const randomIndex = Math.floor(Math.random() * fishImages.length);
      const fishImage = fishImages[randomIndex] || fishImages[index % fishImages.length];
      return {
        ...item,
        fishImage,
      };
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.homeBackground }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.homeBackground}
      />

      {/* Bolhas sutis de ambiente */}
      <AmbientBubble startX={SCREEN_WIDTH * 0.15} size={14} duration={7000} delay={0} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.45} size={8} duration={8500} delay={1500} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.75} size={18} duration={6500} delay={3000} />
      <AmbientBubble startX={SCREEN_WIDTH * 0.88} size={10} duration={9000} delay={800} />

      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Aquário</Text>
        <Text style={[styles.headerSubtitle, { color: '#8EAEC4' }]}>
          Toque em um peixe para ver detalhes e avaliar
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
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishCard: {
    width: 95,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fishImage: {
    width: '100%',
    height: '100%',
  },
  titleBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 115,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(77, 208, 225, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
});

