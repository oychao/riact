import React, { useState } from 'riact';

import ThemeContext, { themes } from '../context/theme';
import Button from './button';
import Count from './count';
import Field from './field';
import List from './list';

const App = function(props: Riact.TStrValObject): JSX.Element {
  const [ routeIndex, setRouteIndex ] = useState(0);
  const [ count, setCount ] = useState(1);
  const [ theme, setTheme ] = useState({
    theme: themes.light
  });
  
  const RouteComponents: Array<JSX.Element> = [
    <Field></Field>,
    <Count stateCount={[ count, setCount ]} ></Count>,
    <List></List>,
  ];

  return (
    <div color={props.color} className={['app-red']}>
      <ThemeContext.Provider value={theme}>
        <h1>Hello My-React</h1>
        <div>
          <Button onClick={(e: Event): void => {
            setTheme({
              theme: theme.theme === themes.light ? themes.dark : themes.light
            });
          }}>ToggleTheme</Button>
        </div>
        <div>
          <a href="javascript:;" onClick={(e: Event) => {
            setRouteIndex(0);
          }}>Field</a>
          &nbsp;
          <a href="javascript:;" onClick={(e: Event) => {
            setRouteIndex(1);
          }}>Count</a>
          &nbsp;
          <a href="javascript:;" onClick={(e: Event) => {
            setRouteIndex(2);
          }}>List</a>
        </div>
        <hr/>
        <div>
          {RouteComponents[routeIndex]}
        </div>
      </ThemeContext.Provider>
    </div>
  );
};

export default App;
