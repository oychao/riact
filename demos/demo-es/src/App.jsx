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
  const activeRoute = useRouter(
    new Map([
      ['/', <List />],
      ['/count', <Count />],
      ['/show_list', <ShowList />],
      ['/profile', <Profile />]
    ])
  );
  const [theme, setTheme] = useState(themes.light);
  return (
    <div>
      <ThemeContext.Provider value={theme}>
        <Header
          toggleTheme={() => {
            setTheme(theme === themes.light ? themes.dark : themes.light);
          }}
        />
        <div>
          <a href="#/">List</a>
          &nbsp;
          <a href="#/count">Count</a>
          &nbsp;
          <a href="#/show_list">Show List</a>
          &nbsp;
          <a href="#/profile">Profile</a>
        </div>
        <hr />
        {activeRoute}
      </ThemeContext.Provider>
    </div>
  );
};

export default App;
