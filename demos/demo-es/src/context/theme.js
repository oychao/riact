import F from 'f';

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

const ThemeContext = F.createContext({
  value: themes.light,
  setTheme: () => {}
});

export default ThemeContext;
