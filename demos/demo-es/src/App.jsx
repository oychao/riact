import Riact, { useState } from 'riact';

import useLifeCycleChecker from './hooks/useLifeCycleChecker';
import useRouter from './hooks/useRouter';

import ThemeContext, { themes } from './context/theme';

import Header from './components/Header';
import List from './components/List';
import Count from './components/Count';
import ShowList from './components/ShowList';
import Profile from './components/Profile';

const App = function() {
  useLifeCycleChecker('App');
  const [links, activeRoute] = useRouter([
    ['list', <List />],
    ['count', <Count />],
    ['show list', <ShowList />],
    ['profile', <Profile />]
  ]);
  const [theme, setTheme] = useState(themes.light);
  return (
    <div>
      <ThemeContext.Provider value={theme}>
        <Header
          toggleTheme={() => {
            setTheme(theme === themes.light ? themes.dark : themes.light);
          }}
        />
        {links}
        <hr />
        {activeRoute}
      </ThemeContext.Provider>
    </div>
  );
};

export default App;
