import Riact, { useContext } from 'riact';

import useLifeCycleChecker from '../hooks/useLifeCycleChecker';

import ThemeContext from '../context/theme';

const ThemedButton = function({ children, onClick }) {
  useLifeCycleChecker('ThemedButton');
  const theme = useContext(ThemeContext);
  return (
    <button style={{ ...theme }} onClick={onClick}>
      {children}
    </button>
  );
};

export default ThemedButton;
