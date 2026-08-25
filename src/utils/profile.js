import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_EXTRAS_KEY_PREFIX = '@profile_extras_';

/**
 * Obtém os dados extras de perfil do usuário (foto, item favorito, tipo favorito).
 * @param {Object} params
 * @param {string|number} params.userId
 * @returns {Promise<Object>} { photoUri, favoriteItemId, favoriteType }
 */
export async function getProfileExtras({ userId }) {
  if (!userId) {
    return {
      photoUri: null,
      favoriteItemId: null,
      favoriteType: null,
    };
  }

  try {
    const raw = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY_PREFIX}${userId}`);
    if (!raw) {
      return {
        photoUri: null,
        favoriteItemId: null,
        favoriteType: null,
      };
    }

    const parsed = JSON.parse(raw);
    return {
      photoUri: parsed.photoUri || null,
      favoriteItemId: parsed.favoriteItemId || null,
      favoriteType: parsed.favoriteType || null,
    };
  } catch (error) {
    console.error('Erro ao buscar dados extras do perfil:', error);
    return {
      photoUri: null,
      favoriteItemId: null,
      favoriteType: null,
    };
  }
}

/**
 * Salva ou atualiza os dados extras de perfil vinculados ao userId.
 * @param {Object} params
 * @param {string|number} params.userId
 * @param {string|null} [params.photoUri]
 * @param {string|null} [params.favoriteItemId]
 * @param {string|null} [params.favoriteType]
 * @returns {Promise<Object>} dados salvos
 */
export async function saveProfileExtras({
  userId,
  photoUri,
  favoriteItemId,
  favoriteType,
}) {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório para salvar dados de perfil.');
  }

  try {
    const current = await getProfileExtras({ userId });

    const updated = {
      ...current,
      ...(photoUri !== undefined && { photoUri }),
      ...(favoriteItemId !== undefined && { favoriteItemId }),
      ...(favoriteType !== undefined && { favoriteType }),
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      `${PROFILE_EXTRAS_KEY_PREFIX}${userId}`,
      JSON.stringify(updated)
    );

    return updated;
  } catch (error) {
    console.error('Erro ao salvar dados extras do perfil:', error);
    throw error;
  }
}
