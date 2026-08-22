import AsyncStorage from '@react-native-async-storage/async-storage';

const RATINGS_KEY = '@ratings';

/**
 * Salva ou atualiza uma avaliação para um usuário e item.
 * Se o usuário já avaliou esse item, atualiza os dados existentes.
 * 
 * @param {Object} params
 * @param {string|number} params.userId - ID do usuário logado
 * @param {string|number} params.itemId - ID do item avaliado
 * @param {number} params.rating - Nota de 1 a 5
 * @param {string} [params.comment] - Comentário opcional
 * @returns {Promise<Object>} Avaliação salva
 */
export async function saveRating({ userId, itemId, rating, comment = '' }) {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório para salvar a avaliação.');
  }
  if (!itemId) {
    throw new Error('ID do item é obrigatório para salvar a avaliação.');
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('A nota deve ser um valor entre 1 e 5.');
  }

  const strUserId = String(userId);
  const strItemId = String(itemId);
  const cleanComment = typeof comment === 'string' ? comment.trim() : '';

  const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
  const ratings = ratingsJson ? JSON.parse(ratingsJson) : [];

  const existingIndex = ratings.findIndex(
    (r) => String(r.userId) === strUserId && String(r.itemId) === strItemId
  );

  const ratingData = {
    userId: strUserId,
    itemId: strItemId,
    rating: Number(rating),
    comment: cleanComment,
    date: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    ratings[existingIndex] = {
      ...ratings[existingIndex],
      ...ratingData,
    };
  } else {
    ratings.push(ratingData);
  }

  await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  return ratingData;
}

/**
 * Obtém a avaliação de um usuário específico para determinado item.
 * 
 * @param {Object} params
 * @param {string|number} params.userId - ID do usuário
 * @param {string|number} params.itemId - ID do item
 * @returns {Promise<Object|null>} Avaliação encontrada ou null
 */
export async function getRatingByUser({ userId, itemId }) {
  if (!userId || !itemId) {
    return null;
  }

  const strUserId = String(userId);
  const strItemId = String(itemId);

  const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
  const ratings = ratingsJson ? JSON.parse(ratingsJson) : [];

  const userRating = ratings.find(
    (r) => String(r.userId) === strUserId && String(r.itemId) === strItemId
  );

  return userRating || null;
}

/**
 * Calcula a média e total de avaliações de um item.
 * 
 * @param {Object} params
 * @param {string|number} params.itemId - ID do item
 * @returns {Promise<{ average: number, total: number }>}
 */
export async function getAverageRating({ itemId }) {
  if (!itemId) {
    return { average: 0, total: 0 };
  }

  const strItemId = String(itemId);

  const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
  const ratings = ratingsJson ? JSON.parse(ratingsJson) : [];

  const itemRatings = ratings.filter((r) => String(r.itemId) === strItemId);

  if (itemRatings.length === 0) {
    return { average: 0, total: 0 };
  }

  const sum = itemRatings.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
  const average = Number((sum / itemRatings.length).toFixed(1));

  return {
    average,
    total: itemRatings.length,
  };
}

/**
 * Retorna todas as avaliações de um determinado item.
 * 
 * @param {Object} params
 * @param {string|number} params.itemId - ID do item
 * @returns {Promise<Array<Object>>} Lista de avaliações: { userId, itemId, rating, comment, date }
 */
export async function getRatingsByItem({ itemId }) {
  if (!itemId) {
    return [];
  }

  const strItemId = String(itemId);
  const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
  const ratings = ratingsJson ? JSON.parse(ratingsJson) : [];

  return ratings.filter((r) => String(r.itemId) === strItemId);
}

/**
 * Retorna todas as avaliações de um item já com os dados do usuário (ex: userName) mesclados.
 * 
 * @param {Object} params
 * @param {string|number} params.itemId - ID do item
 * @returns {Promise<Array<Object>>} Lista de avaliações enriquecidas com userName
 */
export async function getRatingsWithUserDetails({ itemId }) {
  if (!itemId) {
    return [];
  }

  const itemRatings = await getRatingsByItem({ itemId });
  if (itemRatings.length === 0) {
    return [];
  }

  const usersJson = await AsyncStorage.getItem('@users');
  const users = usersJson ? JSON.parse(usersJson) : [];
  const usersMap = new Map(users.map((u) => [String(u.id), u.name || 'Usuário']));

  return itemRatings.map((r) => ({
    ...r,
    userName: usersMap.get(String(r.userId)) || 'Usuário Anônimo',
  }));
}

/**
 * Alias para getAllRatingsForItem (mantendo retrocompatibilidade).
 */
export const getAllRatingsForItem = getRatingsByItem;

