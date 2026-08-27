// Imagem padrão de fallback / placeholder para itens sem capa local exclusiva
const defaultPlaceholder = require('../../assets/catalog/item1.jpg');

export const catalogImages = {
  // Itens originais com capas locais existentes
  "1": require('../../assets/catalog/item1.jpg'),
  "2": require('../../assets/catalog/item2.jpg'),
  "3": require('../../assets/catalog/item3.jpg'),
  "4": require('../../assets/catalog/item4.jpg'),
  "5": require('../../assets/catalog/item5.jpg'),
  "6": require('../../assets/catalog/item6.jpg'),

  // Novos Filmes (placeholder local + imageUrl remoto no catalog.json)
  "7": defaultPlaceholder,
  "8": defaultPlaceholder,
  "9": defaultPlaceholder,
  "10": defaultPlaceholder,
  "11": defaultPlaceholder,
  "12": defaultPlaceholder,
  "13": defaultPlaceholder,
  "14": defaultPlaceholder,

  // Novas Séries (placeholder local + imageUrl remoto no catalog.json)
  "15": defaultPlaceholder,
  "16": defaultPlaceholder,
  "17": defaultPlaceholder,
  "18": defaultPlaceholder,
  "19": defaultPlaceholder,
  "20": defaultPlaceholder,
  "21": defaultPlaceholder,
  "22": defaultPlaceholder,

  // Novas Músicas (placeholder local + imageUrl remoto no catalog.json)
  "23": defaultPlaceholder,
  "24": defaultPlaceholder,
  "25": defaultPlaceholder,
  "26": defaultPlaceholder,
  "27": defaultPlaceholder,
  "28": defaultPlaceholder,
  "29": defaultPlaceholder,
  "30": defaultPlaceholder,
  "31": defaultPlaceholder,

  // Novos Documentários (placeholder local + imageUrl remoto no catalog.json)
  "32": defaultPlaceholder,
  "33": defaultPlaceholder,
  "34": defaultPlaceholder,
  "35": defaultPlaceholder,
  "36": defaultPlaceholder,
  "37": defaultPlaceholder,
  "38": defaultPlaceholder,
  "39": defaultPlaceholder,
  "40": defaultPlaceholder,
};

export default catalogImages;
