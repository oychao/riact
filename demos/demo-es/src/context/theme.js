import Riact from 'riact';

export const themes = {
  light: {
    color: 'black',
    backgroundColor: 'white'
  },
  dark: {
    color: 'white',
    backgroundColor: 'black'
  }
};
const ThemeContext = Riact.createContext(themes.light);

export default ThemeContext;