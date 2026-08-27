export const darkTheme = {
  // Fundo Exclusivo da Home (Aquário)
  homeBackground: '#071A2B',        // Fundo azul marinho profundo exclusivo da tela inicial (Aquário)
  
  // Fundos Neutros
  background: '#1A1A1E',           // Fundo principal cinza escuro neutro
  backgroundSecondary: '#26262B',  // Fundo de cards, inputs e superfícies
  backgroundTertiary: '#323238',   // Superfícies elevadas e cabeçalhos
  surface: '#26262B',              // Alias para backgroundSecondary
  
  // Bordas e Divisores
  border: '#36363C',               // Bordas de cards e divisores
  borderLight: '#484852',          // Bordas com foco ou destaque

  // Destaques e Ações (Aquático / Turquesa)
  primary: '#00B8D4',              // Azul-turquesa vibrante para botões principais, tabs ativas e badges
  primaryDark: '#008EAA',          // Variação para estados pressionados
  primaryLight: '#33C6DC',         // Variação clara
  accent: '#4DD0E1',               // Verde-água / ciano claro para detalhes e ícones
  accentGlow: 'rgba(0, 184, 212, 0.3)', // Efeito de brilho / sombra

  // Tipografia Neutra
  text: '#FFFFFF',                 // Texto principal de alto contraste
  textSecondary: '#A1A1AA',        // Texto secundário neutro / descrições / subtítulos
  textMuted: '#71717A',            // Texto terciário / chevrons / placeholders

  // Feedback e Alertas
  danger: '#FF4D4D',               // Vermelho exclusivo para erros e ações destrutivas
  dangerDark: '#D32F2F',           // Vermelho escuro
  dangerSurface: 'rgba(255, 77, 77, 0.15)', // Fundo de mensagens de erro

  // Avaliação / Estrelas
  star: '#FFC107',                 // Dourado para estrelas de rating
  starInactive: '#3E3E46',         // Estrela inativa cinza neutro
};

export const lightTheme = {
  // Fundo Exclusivo da Home (Aquário)
  homeBackground: '#071A2B',        // Fundo azul marinho profundo exclusivo da tela inicial (Aquário)
  
  // Fundos Neutros
  background: '#F4F5F7',           // Fundo principal neutro claro
  backgroundSecondary: '#FFFFFF',  // Fundo de cards, inputs e superfícies
  backgroundTertiary: '#E8EAED',   // Superfícies elevadas e cabeçalhos
  surface: '#FFFFFF',              // Alias para backgroundSecondary
  
  // Bordas e Divisores
  border: '#E0E2E7',               // Bordas de cards e divisores
  borderLight: '#D0D4DC',          // Bordas com foco ou destaque

  // Destaques e Ações (Aquático / Turquesa)
  primary: '#00B8D4',              // Azul-turquesa vibrante mantido como destaque
  primaryDark: '#008EAA',          // Variação para estados pressionados
  primaryLight: '#33C6DC',         // Variação clara
  accent: '#0097A7',               // Ciano escurecido para contraste em fundos claros
  accentGlow: 'rgba(0, 184, 212, 0.15)', // Efeito de brilho / sombra suave

  // Tipografia Neutra
  text: '#18181B',                 // Texto principal escuro de alto contraste
  textSecondary: '#64748B',        // Texto secundário / descrições / subtítulos
  textMuted: '#94A3B8',            // Texto terciário / chevrons / placeholders

  // Feedback e Alertas
  danger: '#E53935',               // Vermelho para erros e ações destrutivas
  dangerDark: '#C62828',           // Vermelho escuro
  dangerSurface: 'rgba(229, 57, 53, 0.1)', // Fundo de mensagens de erro

  // Avaliação / Estrelas
  star: '#FFA000',                 // Dourado para estrelas de rating
  starInactive: '#CBD5E1',         // Estrela inativa neutra clara
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const colors = darkTheme;
export default darkTheme;
