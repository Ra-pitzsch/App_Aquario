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
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import AuthLink from '../components/AuthLink';
import { useAuth } from '../context/AuthContext';

export default function CadastroScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, login } = useAuth();

  const handleRegister = async () => {
    // 1. Validação de campos vazios
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    // 2. Validação de confirmação de senha
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    try {
      setIsSubmitting(true);
      // 3. Registro do usuário no Context
      const regResult = await register(name, email, password);

      if (!regResult.success) {
        Alert.alert('Erro no cadastro', regResult.message);
        return;
      }

      // 4. Loga automaticamente em seguida
      const loginResult = await login(email, password);
      if (!loginResult.success) {
        Alert.alert(
          'Sucesso',
          'Conta criada! Por favor, faça login com suas credenciais.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao realizar o cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#141218" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎬</Text>
          </View>
          <Text style={styles.appName}>Aquário</Text>
          <Text style={styles.subtitle}>
            Crie sua conta para começar a registrar suas avaliações
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Criar Conta</Text>

          <Text style={styles.label}>Nome</Text>
          <CustomInput
            placeholder="Seu nome completo"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>E-mail</Text>
          <CustomInput
            placeholder="seuemail@exemplo.com"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <CustomInput
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirmar Senha</Text>
          <CustomInput
            placeholder="••••••••"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <CustomButton
            title="Cadastrar"
            onPress={handleRegister}
            loading={isSubmitting}
          />

          <AuthLink
            text="Já tem uma conta? Entrar"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E63950',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#E63950',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 30,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#A9A6B2',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#1E1B24',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C7C4D0',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
