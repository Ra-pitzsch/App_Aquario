import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@users';
const CURRENT_USER_KEY = '@currentUser';

/**
 * Cadastra um novo usuário no AsyncStorage.
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} usuário cadastrado
 */
export async function registerUser({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  const users = usersJson ? JSON.parse(usersJson) : [];

  const existingUser = users.find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  if (existingUser) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  const newUser = {
    id: Date.now().toString(),
    name: cleanName,
    email: cleanEmail,
    password: password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

  return newUser;
}

/**
 * Valida credenciais e inicia sessão do usuário no AsyncStorage.
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} usuário logado
 */
export async function loginUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();

  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  const users = usersJson ? JSON.parse(usersJson) : [];

  const user = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  );

  if (!user) {
    throw new Error('E-mail ou senha inválidos.');
  }

  // Salva o id do usuário logado na chave @currentUser
  await AsyncStorage.setItem(CURRENT_USER_KEY, user.id);

  return user;
}

/**
 * Obtém o usuário atualmente autenticado.
 * @returns {Promise<Object|null>} dados do usuário logado ou null
 */
export async function getCurrentUser() {
  const currentUserId = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUserId) {
    return null;
  }

  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  const users = usersJson ? JSON.parse(usersJson) : [];

  const user = users.find((u) => u.id === currentUserId);

  if (!user) {
    // Se o id não for encontrado na lista, limpa a sessão corrompida
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }

  return user;
}

/**
 * Encerra a sessão do usuário atual.
 */
export async function logoutUser() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Retorna todos os usuários cadastrados no AsyncStorage.
 * @returns {Promise<Array<Object>>} lista de usuários
 */
export async function getAllUsers() {
  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * Busca um usuário pelo ID.
 * @param {string|number} userId
 * @returns {Promise<Object|null>}
 */
export async function getUserById(userId) {
  if (!userId) return null;
  const users = await getAllUsers();
  return users.find((u) => String(u.id) === String(userId)) || null;
}

/**
 * Atualiza os dados cadastrais de um usuário (nome, e-mail, senha).
 * @param {Object} params
 * @param {string|number} params.userId
 * @param {string} [params.name]
 * @param {string} [params.email]
 * @param {string} [params.currentPassword]
 * @param {string} [params.newPassword]
 * @returns {Promise<Object>} usuário atualizado
 */
export async function updateUserProfile({
  userId,
  name,
  email,
  currentPassword,
  newPassword,
}) {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório.');
  }

  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  const users = usersJson ? JSON.parse(usersJson) : [];

  const userIndex = users.findIndex((u) => String(u.id) === String(userId));
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado.');
  }

  const user = users[userIndex];

  // Atualização de Nome
  if (name !== undefined) {
    const cleanName = name.trim();
    if (!cleanName) {
      throw new Error('O nome não pode ficar em branco.');
    }
    user.name = cleanName;
  }

  // Atualização de E-mail
  if (email !== undefined) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('O e-mail não pode ficar em branco.');
    }

    const emailInUse = users.some(
      (u) => String(u.id) !== String(userId) && u.email.toLowerCase() === cleanEmail
    );
    if (emailInUse) {
      throw new Error('Este e-mail já está sendo utilizado por outra conta.');
    }

    user.email = cleanEmail;
  }

  // Atualização de Senha
  if (newPassword !== undefined && newPassword !== '') {
    if (!currentPassword) {
      throw new Error('Informe a senha atual para alterar a senha.');
    }
    if (user.password !== currentPassword) {
      throw new Error('A senha atual informada está incorreta.');
    }
    if (newPassword.length < 4) {
      throw new Error('A nova senha deve ter no mínimo 4 caracteres.');
    }
    user.password = newPassword;
  }

  user.updatedAt = new Date().toISOString();
  users[userIndex] = user;

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

  return user;
}

