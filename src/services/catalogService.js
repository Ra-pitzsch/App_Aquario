import catalog from '../data/catalog.json';
import { catalogImages } from '../data/images';

/**
 * Busca um item do catálogo pelo ID.
 * Centraliza a obtenção de dados para facilitar a futura migração para APIs externas.
 * 
 * @param {string} id - ID do item
 * @returns {Object|null} Objeto do item com seus dados e imagem correspondente
 */
export function getItemById(id) {
  const item = catalog.find((entry) => entry.id === String(id));
  if (!item) {
    return null;
  }

  const imageSource = item.imageUrl
    ? { uri: item.imageUrl }
    : (catalogImages[item.id] || null);

  return {
    ...item,
    image: imageSource,
  };
}

/**
 * Retorna todos os itens do catálogo com suas respectivas imagens.
 * 
 * @returns {Array<Object>} Lista de itens do catálogo
 */
export function getAllItems() {
  return catalog.map((item) => ({
    ...item,
    image: item.imageUrl
      ? { uri: item.imageUrl }
      : (catalogImages[item.id] || null),
  }));
}
