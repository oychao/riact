import React from 'riact';

export const themes = {
  light: {
    color: '#000000',
    backgroundColor: '#eeeeee',
  },
  dark: {
    color: '#ffffff',
    backgroundColor: '#222222',
  },
};

const ThemeContext = React.createContext({
  theme: themes.dark
});

export default ThemeContext;
