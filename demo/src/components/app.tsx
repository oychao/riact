import React, { useState } from 'riact';

import ThemeContext, { themes } from '../context/theme';
import Button from './button';
import Count from './count';
import FieldBasic from './fieldBasic';
import List from './list';
import FieldModel from './fieldModel';
import useRouter from '../hooks/useRouter';
import FieldStore from './fieldStore';

const App = function(props: Riact.TStrValObject): JSX.Element {
  const [count, setCount] = useState(1);

  const routerHook = useRouter([
    {
      name: 'FieldBasic',
      component: FieldBasic
    },
    {
      name: 'FieldModel',
      component: FieldModel
    },
    {
      name: 'FieldStore',
      component: FieldStore
    },
    {
      name: 'Count',
      component: Count,
      props: {
        stateCount: [count, setCount]
      }
    },
    {
      name: 'List',
      component: List
    }
  ]);
  const [theme, setTheme] = useState({
    theme: themes.light
  });

  return (
    <div color={props.color} className={['app-red']}>
      <ThemeContext.Provider value={theme}>
        <h1>{'<div>Hello World</div>'}</h1>
        <div>
          <Button
            onClick={(): void => {
              setTheme({
                theme: theme.theme === themes.light ? themes.dark : themes.light
              });
            }}
          >
            Toggle Theme
          </Button>
        </div>
        <div>{routerHook.links}</div>
        <hr />
        <div>{routerHook.activeComp}</div>
      </ThemeContext.Provider>
    </div>
  );
};

export default App;
