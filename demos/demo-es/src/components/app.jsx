import F, { useState } from 'f';

import ThemeContext, { themes } from '../context/theme';
import UserContext from '../context/user';

import useContextComposer from '../hooks/useContextComposer';

import Main from './main';

const ComposedContext = useContextComposer(ThemeContext, UserContext);

const App = function(props) {
  const [curTheme, setCurTheme] = useState(themes.light);
  return (
    <div>
      <ComposedContext values={[{ value: curTheme, setTheme: setCurTheme }]}>
        <h1 style={{ ...props }}>hello world</h1>
        <hr/>
        <Main></Main>
      </ComposedContext>
    </div>
  );
};

export default App;
