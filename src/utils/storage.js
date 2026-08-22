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

