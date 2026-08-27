import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
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

// Quantidade de peixes nadando simultaneamente no aquário
const NUM_FISH = 6;

// Faixas verticais base para distribuir os peixes sem sobreposição excessiva
const VERTICAL_LANES = [
  { min: 4, max: 15 },
  { min: 17, max: 28 },
  { min: 30, max: 41 },
  { min: 43, max: 54 },
  { min: 56, max: 67 },
  { min: 69, max: 80 },
];

/**
 * Bolha sutil animada para o fundo do aquário (pointerEvents="none" para não bloquear toques)
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
      pointerEvents="none"
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
 * Peixe que nada continuamente atravessando a tela da esquerda pra direita ou vice-versa,
 * trocando dinamicamente de mídia e de peixe a cada travessia e respondendo a toques a qualquer momento.
 *
 * Todas as funções do ciclo (startSwim, scheduleNextSwim, handlePress) são armazenadas
 * em refs e chamadas via indireção para evitar closures congeladas nos callbacks de animação.
 */
function SwimmingFish({ index, navigation }) {
  const isMounted = useRef(true);
  const timeoutRef = useRef(null);
  const swimAnimRef = useRef(null);

  // Estados dinâmicos do peixe e do item representado
  const [item, setItem] = useState(() => {
    return catalog[(index * 3) % catalog.length] || catalog[0];
  });
  const [fishImage, setFishImage] = useState(() => {
    return fishImages[index % fishImages.length] || fishImages[0];
  });
  const [direction, setDirection] = useState(() => (index % 2 === 0 ? 'ltr' : 'rtl'));
  const [topPercent, setTopPercent] = useState(() => {
    const lane = VERTICAL_LANES[index % VERTICAL_LANES.length];
    return lane.min + Math.floor(Math.random() * (lane.max - lane.min));
  });

  // Ref sempre atualizada com o item atual para navegação segura no momento do toque
  const itemRef = useRef(item);
  useEffect(() => {
    itemRef.current = item;
  }, [item]);

  const translateX = useRef(new Animated.Value(-150)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  // --- Refs para funções do ciclo (evita closures congeladas) ---
  const startSwimRef = useRef(null);
  const scheduleNextSwimRef = useRef(null);

  // Ondulação vertical suave (efeito natural de nado)
  useEffect(() => {
    const durationY = 2000 + (index % 3) * 400;
    const distanceY = 6 + (index % 2) * 3;

    const bobbing = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -distanceY,
          duration: durationY,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(floatY, {
          toValue: distanceY,
          duration: durationY,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: durationY * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    bobbing.start();

    return () => bobbing.stop();
  }, [index]);

  // Função para iniciar uma jornada completa de travessia do peixe
  // Atualizada na ref a cada render para sempre ter acesso ao estado mais recente
  startSwimRef.current = (isInitial = false) => {
    if (!isMounted.current) return;

    // Sorteia um novo item do catálogo
    const randomItem = catalog[Math.floor(Math.random() * catalog.length)];
    // Sorteia uma imagem de peixe
    const randomFish = fishImages[Math.floor(Math.random() * fishImages.length)];
    // Sorteia direção (50% esquerda -> direita, 50% direita -> esquerda)
    const isLtr = Math.random() > 0.5;
    // Sorteia altura dentro da faixa vertical atribuída ao peixe
    const lane = VERTICAL_LANES[index % VERTICAL_LANES.length];
    const newTop = lane.min + Math.floor(Math.random() * (lane.max - lane.min));

    setItem(randomItem);
    setFishImage(randomFish);
    setDirection(isLtr ? 'ltr' : 'rtl');
    setTopPercent(newTop);

    const startX = isLtr ? -140 : SCREEN_WIDTH + 140;
    const endX = isLtr ? SCREEN_WIDTH + 140 : -140;
    const totalDistance = Math.abs(endX - startX);

    // Duração entre 9s e 15s para cruzar a tela
    const duration = 9000 + Math.random() * 6000;

    // No carregamento inicial, posiciona alguns peixes já no meio da tela para o aquário começar vivo
    if (isInitial) {
      const initialProgress = (index * 0.16) + (Math.random() * 0.15);
      const currentX = startX + (endX - startX) * initialProgress;
      const remainingDistance = Math.abs(endX - currentX);
      const remainingDuration = duration * (remainingDistance / totalDistance);

      translateX.setValue(currentX);

      swimAnimRef.current = Animated.timing(translateX, {
        toValue: endX,
        duration: Math.max(remainingDuration, 3000),
        easing: Easing.linear,
        useNativeDriver: false,
      });

      swimAnimRef.current.start(({ finished }) => {
        if (finished && isMounted.current) {
          // Chama via ref → sempre a versão mais recente
          scheduleNextSwimRef.current?.();
        }
      });
      return;
    }

    translateX.setValue(startX);

    swimAnimRef.current = Animated.timing(translateX, {
      toValue: endX,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    swimAnimRef.current.start(({ finished }) => {
      if (finished && isMounted.current) {
        // Chama via ref → sempre a versão mais recente
        scheduleNextSwimRef.current?.();
      }
    });
  };

  scheduleNextSwimRef.current = () => {
    // Delay aleatório entre 600ms e 2500ms antes de começar a próxima travessia
    const delay = 600 + Math.random() * 2000;
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        // Chama via ref → sempre a versão mais recente
        startSwimRef.current?.(false);
      }
    }, delay);
  };

  // Inicia o ciclo de nado uma única vez na montagem
  useEffect(() => {
    isMounted.current = true;
    startSwimRef.current?.(true);

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (swimAnimRef.current) swimAnimRef.current.stop();
    };
  }, []);

  // Handler de toque estável (referência nunca muda) que lê o item via ref no momento do clique
  const handlePress = useCallback(() => {
    console.log("Peixe tocado", itemRef.current);
    const currentItem = itemRef.current;
    if (currentItem && currentItem.id) {
      navigation.navigate('Detalhes', { id: currentItem.id });
    }
  }, [navigation]);

  return (
    <Animated.View
      style={[
        styles.swimmingContainer,
        {
          top: `${topPercent}%`,
          transform: [{ translateX }, { translateY: floatY }],
        },
      ]}
    >
      <Pressable
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        onPress={handlePress}
        style={styles.fishTouchable}
      >
        {/* Peixe com fundo transparente (espelhado horizontalmente se nadar para a esquerda) */}
        <View style={styles.fishWrapper} pointerEvents="none">
          <Image
            source={fishImage}
            style={[
              styles.fishImage,
              direction === 'rtl' && styles.fishImageFlipped,
            ]}
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
          pointerEvents="none"
        >
          <Text
            style={[styles.itemTitle, { color: '#FFFFFF' }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.homeBackground }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.homeBackground}
      />

      {/* Bolhas sutis de ambiente subindo pelo aquário */}
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
        {Array.from({ length: NUM_FISH }).map((_, index) => (
          <SwimmingFish
            key={`fish-${index}`}
            index={index}
            navigation={navigation}
          />
        ))}
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
  swimmingContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 5,
  },
  fishTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishWrapper: {
    width: 100,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fishImage: {
    width: '100%',
    height: '100%',
  },
  fishImageFlipped: {
    transform: [{ scaleX: -1 }],
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


