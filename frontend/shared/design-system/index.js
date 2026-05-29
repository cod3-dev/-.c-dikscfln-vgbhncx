// Afya CarePath Design System
// Shared design tokens and component utilities

export const tokens = {
  colors: {
    bg: '#04110d',
    surface: '#0a1f18',
    accent: '#52ffa8',
    accentDim: '#2d8a5a',
    text: '#e8f5f0',
    textDim: '#9db5a8',
    border: '#1a3329',
    error: '#ff6b6b',
    warning: '#ffd93d',
    success: '#52ffa8'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem', 
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  breakpoints: {
    mobile: '760px',
    tablet: '1100px'
  }
};

export const createButton = (text, variant = 'primary') => {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = `btn btn--${variant}`;
  return button;
};

export const createCard = (content) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = content;
  return card;
};