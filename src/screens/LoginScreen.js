import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [isCadastro, setIsCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#141218" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎬</Text>
          </View>
          <Text style={styles.appName}>Aquário</Text>
          <Text style={styles.subtitle}>
            Avalie filmes, séries, músicas e documentários
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isCadastro ? 'Criar conta' : 'Entrar'}
          </Text>

          {isCadastro && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#8A8794"
                value={nome}
                onChangeText={setNome}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#8A8794"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#8A8794"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          {!isCadastro && (
            <TouchableOpacity>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation && navigation.navigate('Lista')}
          >
            <Text style={styles.primaryButtonText}>
              {isCadastro ? 'Cadastrar' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Continuar com Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => setIsCadastro(!isCadastro)}
        >
          <Text style={styles.switchText}>
            {isCadastro ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
            <Text style={styles.switchLink}>
              {isCadastro ? 'Entrar' : 'Cadastre-se'}
            </Text>
          </Text>
        </TouchableOpacity>
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
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E63950',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoEmoji: {
    fontSize: 34,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#A9A6B2',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C7C4D0',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: '#141218',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2733',
  },
  forgotText: {
    color: '#E63950',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#E63950',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#E63950',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2733',
  },
  dividerText: {
    color: '#6F6C79',
    fontSize: 12,
    marginHorizontal: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2A2733',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  switchRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    color: '#A9A6B2',
    fontSize: 13,
  },
  switchLink: {
    color: '#E63950',
    fontWeight: '700',
  },
});