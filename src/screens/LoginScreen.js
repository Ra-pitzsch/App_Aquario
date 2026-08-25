import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import AuthLink from '../components/AuthLink';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login(email, password);

      if (!result.success) {
        Alert.alert('Erro ao entrar', result.message);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao fazer login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top > 0 ? insets.top + 16 : 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ]}
          >
            <Text style={styles.logoEmoji}>🐠</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Aquário</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Avalie filmes, séries, músicas e documentários
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Entrar</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>E-mail</Text>
          <CustomInput
            placeholder="seuemail@exemplo.com"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Senha</Text>
          <CustomInput
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <CustomButton
            title="Entrar"
            onPress={handleLogin}
            loading={isSubmitting}
          />

          <AuthLink
            text="Não tem uma conta? Cadastre-se"
            onPress={() => navigation.navigate('Cadastro')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 34,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});