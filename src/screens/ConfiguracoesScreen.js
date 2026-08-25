import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
  Switch,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getProfileExtras, saveProfileExtras } from '../utils/profile';
import catalog from '../data/catalog.json';
import { catalogImages } from '../data/images';
import CustomButton from '../components/CustomButton';

const MEDIA_TYPES = [
  { id: 'filme', label: 'Filme' },
  { id: 'serie', label: 'Série' },
  { id: 'musica', label: 'Música' },
  { id: 'documentario', label: 'Documentário' },
];

export default function ConfiguracoesScreen({ navigation }) {
  const { user, updateUser, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Estados dos dados de perfil extras
  const [photoUri, setPhotoUri] = useState(null);
  const [favoriteItemId, setFavoriteItemId] = useState(null);
  const [favoriteType, setFavoriteType] = useState(null);

  // Estados do formulário de dados cadastrais
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingAccount, setSavingAccount] = useState(false);

  // Estados do formulário de alteração de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Estado do Modal de Mídia Favorita
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Carrega dados extras do perfil ao montar
  useEffect(() => {
    async function loadExtras() {
      if (user?.id) {
        const extras = await getProfileExtras({ userId: user.id });
        setPhotoUri(extras.photoUri);
        setFavoriteItemId(extras.favoriteItemId);
        setFavoriteType(extras.favoriteType);
      }
    }
    loadExtras();
  }, [user?.id]);

  // Atualiza nome e email se user mudar
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  /**
   * Escolhe foto da galeria
   */
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permissão Necessária',
          'É necessário conceder permissão de acesso à galeria de fotos para escolher uma foto de perfil.'
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const uri = pickerResult.assets[0].uri;
        setPhotoUri(uri);
        await saveProfileExtras({ userId: user.id, photoUri: uri });
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem da galeria.');
    }
  };

  /**
   * Remove a foto de perfil
   */
  const handleRemovePhoto = async () => {
    try {
      setPhotoUri(null);
      await saveProfileExtras({ userId: user.id, photoUri: null });
      Alert.alert('Sucesso', 'Foto de perfil removida.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover a foto.');
    }
  };

  /**
   * Salva alterações de Nome e E-mail
   */
  const handleSaveAccountInfo = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar vazio.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Atenção', 'O e-mail não pode ficar vazio.');
      return;
    }

    try {
      setSavingAccount(true);
      const result = await updateUser({
        name: name.trim(),
        email: email.trim(),
      });

      if (result.success) {
        Alert.alert('Sucesso', 'Dados cadastrais atualizados com sucesso!');
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível atualizar os dados.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as alterações.');
    } finally {
      setSavingAccount(false);
    }
  };

  /**
   * Salva alteração de senha
   */
  const handleSavePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Atenção', 'Por favor, informe a sua senha atual.');
      return;
    }
    if (!newPassword) {
      Alert.alert('Atenção', 'Por favor, informe a nova senha.');
      return;
    }
    if (newPassword.length < 4) {
      Alert.alert('Atenção', 'A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Atenção', 'A confirmação de senha não confere com a nova senha.');
      return;
    }

    try {
      setSavingPassword(true);
      const result = await updateUser({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível alterar a senha.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao alterar a senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  /**
   * Define o tipo de mídia favorito
   */
  const handleSelectFavoriteType = async (typeId) => {
    const nextType = favoriteType === typeId ? null : typeId;
    setFavoriteType(nextType);
    try {
      await saveProfileExtras({ userId: user.id, favoriteType: nextType });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o tipo favorito.');
    }
  };

  /**
   * Define o item favorito
   */
  const handleSelectFavoriteItem = async (itemId) => {
    const nextItem = favoriteItemId === itemId ? null : itemId;
    setFavoriteItemId(nextItem);
    setModalVisible(false);
    try {
      await saveProfileExtras({ userId: user.id, favoriteItemId: nextItem });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o item favorito.');
    }
  };

  /**
   * Logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza de que deseja encerrar a sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const selectedFavoriteItem = catalog.find((i) => i.id === favoriteItemId);
  const filteredCatalog = catalog.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header Superior */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top > 0 ? insets.top + 8 : 14,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Seção: Foto de Perfil */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Foto de Perfil</Text>

          <View style={styles.photoContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  {
                    backgroundColor: 'rgba(0, 184, 212, 0.2)',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text style={[styles.avatarPlaceholderText, { color: colors.primary }]}>
                  {userInitial}
                </Text>
              </View>
            )}

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Text style={styles.photoButtonText}>
                  {photoUri ? 'Alterar Foto' : 'Escolher da Galeria'}
                </Text>
              </TouchableOpacity>

              {photoUri && (
                <TouchableOpacity
                  style={[
                    styles.removePhotoButton,
                    {
                      borderColor: colors.danger,
                    },
                  ]}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.removePhotoText, { color: colors.danger }]}>
                    Remover Foto
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Seção: Aparência / Tema */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Aparência</Text>
          <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
              <Text style={[styles.themeLabel, { color: colors.text }]}>
                {isDark ? '🌙 Tema Escuro' : '☀️ Tema Claro'}
              </Text>
              <Text style={[styles.themeDesc, { color: colors.textSecondary }]}>
                {isDark
                  ? 'Visual noturno com paleta de cores aquática'
                  : 'Visual diurno claro de alto contraste'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* Seção: Preferências de Conteúdo */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>
            Preferências de Mídia
          </Text>

          {/* Tipo de Mídia Favorito */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Tipo de Mídia Favorito
          </Text>
          <View style={styles.typeChipsRow}>
            {MEDIA_TYPES.map((type) => {
              const isSelected = favoriteType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.backgroundTertiary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleSelectFavoriteType(type.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      isSelected && styles.typeChipTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mídia Favorita */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>
            Mídia Favorita
          </Text>
          <TouchableOpacity
            style={[
              styles.favoriteSelector,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            {selectedFavoriteItem ? (
              <View style={styles.selectedItemRow}>
                {catalogImages[selectedFavoriteItem.id] ? (
                  <Image
                    source={catalogImages[selectedFavoriteItem.id]}
                    style={styles.selectedItemThumb}
                  />
                ) : (
                  <View
                    style={[
                      styles.selectedItemThumb,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  />
                )}
                <View style={styles.selectedItemInfo}>
                  <Text
                    style={[styles.selectedItemTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {selectedFavoriteItem.title}
                  </Text>
                  <Text style={[styles.selectedItemYear, { color: colors.textMuted }]}>
                    {selectedFavoriteItem.year} • {selectedFavoriteItem.type}
                  </Text>
                </View>
                <Text style={[styles.changeSelectorText, { color: colors.primary }]}>
                  Trocar
                </Text>
              </View>
            ) : (
              <View style={styles.emptyFavoriteRow}>
                <Text style={[styles.emptyFavoriteText, { color: colors.textMuted }]}>
                  Toque para escolher uma mídia favorita...
                </Text>
                <Text style={[styles.selectorChevron, { color: colors.textMuted }]}>›</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Seção: Dados da Conta */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Dados da Conta</Text>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nome Completo</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Seu nome"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-mail</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <CustomButton
            title={savingAccount ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSaveAccountInfo}
            loading={savingAccount}
          />
        </View>

        {/* Seção: Alterar Senha */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Alterar Senha</Text>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Senha Atual</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nova Senha</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Confirmar Nova Senha
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <CustomButton
            title={savingPassword ? 'Alterando...' : 'Atualizar Senha'}
            onPress={handleSavePassword}
            loading={savingPassword}
          />
        </View>

        {/* Seção: Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: 'rgba(255, 77, 77, 0.35)',
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.logoutButtonText, { color: colors.danger }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Seleção de Mídia Favorita */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Escolha a Mídia Favorita
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={[styles.modalCloseText, { color: colors.primary }]}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalSearchInput,
                {
                  backgroundColor: colors.backgroundTertiary,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Buscar no catálogo..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredCatalog}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = favoriteItemId === item.id;
                const imageSource = catalogImages[item.id];

                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItemRow,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(0, 184, 212, 0.15)'
                          : colors.backgroundSecondary,
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => handleSelectFavoriteItem(item.id)}
                    activeOpacity={0.7}
                  >
                    {imageSource ? (
                      <Image source={imageSource} style={styles.modalItemThumb} />
                    ) : (
                      <View
                        style={[
                          styles.modalItemThumb,
                          { backgroundColor: colors.backgroundTertiary },
                        ]}
                      />
                    )}
                    <View style={styles.modalItemInfo}>
                      <Text
                        style={[
                          styles.modalItemTitle,
                          { color: isSelected ? colors.primary : colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.modalItemMeta, { color: colors.textMuted }]}>
                        {item.year} • {item.type}
                      </Text>
                    </View>
                    {isSelected && (
                      <Text style={[styles.modalCheck, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerPlaceholder: {
    width: 60,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#00B8D4',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 34,
    fontWeight: '800',
  },
  photoActions: {
    flex: 1,
    marginLeft: 16,
  },
  photoButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  removePhotoButton: {
    marginTop: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeInfo: {
    flex: 1,
    marginRight: 10,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  themeDesc: {
    fontSize: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  typeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeChipTextSelected: {
    fontWeight: '700',
  },
  favoriteSelector: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  emptyFavoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  emptyFavoriteText: {
    fontSize: 13,
  },
  selectorChevron: {
    fontSize: 20,
  },
  selectedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItemThumb: {
    width: 44,
    height: 58,
    borderRadius: 6,
  },
  selectedItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  selectedItemYear: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  changeSelectorText: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '80%',
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSearchInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: 0.5,
  },
  modalItemThumb: {
    width: 40,
    height: 52,
    borderRadius: 6,
  },
  modalItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalItemMeta: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  modalCheck: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
});
