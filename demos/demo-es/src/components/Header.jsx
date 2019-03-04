import Riact from 'riact';

import useLifeCycleChecker from '../hooks/useLifeCycleChecker';

import ThemedButton from './ThemedButton';

const Header = function({ toggleTheme }) {
  useLifeCycleChecker('Header');
  return (
    <div>
      <h1>Hello Riact</h1>
      <ThemedButton onClick={toggleTheme}>toggle theme</ThemedButton>
    </div>
  );
};

export default Header;
