export const darkTheme = {
  // Fundos
  background: '#071A2B',           // Fundo principal azul marinho profundo
  backgroundSecondary: '#0F2D47',  // Fundo de cards, inputs e superfícies
  backgroundTertiary: '#163B5C',   // Superfícies elevadas e cabeçalhos
  surface: '#0F2D47',              // Alias para backgroundSecondary
  
  // Bordas e Divisores
  border: '#1B476E',               // Bordas de cards e divisores
  borderLight: '#255A8A',          // Bordas com foco ou destaque

  // Destaques e Ações (Aquático)
  primary: '#00B8D4',              // Azul-turquesa vibrante para botões principais, tabs ativas e badges
  primaryDark: '#008EAA',          // Variação para estados pressionados
  primaryLight: '#33C6DC',         // Variação clara
  accent: '#4DD0E1',               // Verde-água / ciano claro para detalhes e ícones
  accentGlow: 'rgba(0, 184, 212, 0.3)', // Efeito de brilho / sombra

  // Tipografia
  text: '#FFFFFF',                 // Texto principal de alto contraste
  textSecondary: '#8EAEC4',        // Texto secundário / descrições / subtítulos
  textMuted: '#5B7F9E',            // Texto terciário / chevrons / placeholders

  // Feedback e Alertas
  danger: '#FF4D4D',               // Vermelho exclusivo para erros e ações destrutivas
  dangerDark: '#D32F2F',           // Vermelho escuro
  dangerSurface: 'rgba(255, 77, 77, 0.15)', // Fundo de mensagens de erro

  // Avaliação / Estrelas
  star: '#FFC107',                 // Dourado para estrelas de rating
  starInactive: '#1B476E',         // Estrela inativa
};

export const lightTheme = {
  // Fundos
  background: '#F0F6FA',           // Fundo principal claro aquático
  backgroundSecondary: '#FFFFFF',  // Fundo de cards, inputs e superfícies
  backgroundTertiary: '#E1EEF6',   // Superfícies elevadas e cabeçalhos
  surface: '#FFFFFF',              // Alias para backgroundSecondary
  
  // Bordas e Divisores
  border: '#D0E1ED',               // Bordas de cards e divisores
  borderLight: '#B8D5E5',          // Bordas com foco ou destaque

  // Destaques e Ações (Aquático)
  primary: '#00B8D4',              // Azul-turquesa vibrante mantido como destaque
  primaryDark: '#008EAA',          // Variação para estados pressionados
  primaryLight: '#33C6DC',         // Variação clara
  accent: '#0097A7',               // Ciano escurecido para contraste em fundos claros
  accentGlow: 'rgba(0, 184, 212, 0.15)', // Efeito de brilho / sombra suave

  // Tipografia
  text: '#071A2B',                 // Texto principal escuro de alto contraste
  textSecondary: '#4A6D8C',        // Texto secundário / descrições / subtítulos
  textMuted: '#7A9AB5',            // Texto terciário / chevrons / placeholders

  // Feedback e Alertas
  danger: '#E53935',               // Vermelho para erros e ações destrutivas
  dangerDark: '#C62828',           // Vermelho escuro
  dangerSurface: 'rgba(229, 57, 53, 0.1)', // Fundo de mensagens de erro

  // Avaliação / Estrelas
  star: '#FFA000',                 // Dourado para estrelas de rating
  starInactive: '#CFD8DC',         // Estrela inativa
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const colors = darkTheme;
export default darkTheme;
