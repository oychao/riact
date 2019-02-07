import React, { useState } from 'react';

import ThemeContext, { themes } from '../context/theme';
import Button from './button';
import Count from './count';
import Field from './field';
import List from './list';

const App = function(props: common.TStrValObject): JSX.Element {
  const [ routeIndex, setRouteIndex ] = useState(0);
  const [ count, setCount ] = useState(1);
  const [ theme, setTheme ] = useState({
    theme: themes.light
  });
  
  const RouteComponents: Array<JSX.Element> = [
    <List></List>,
    <Count stateCount={[ count, setCount ]} ></Count>,
    <Field></Field>,
  ];

  return (
    <div color={props.color}>
      <ThemeContext.Provider value={theme}>
        <h1>Hello My-React</h1>
        <div>
          <Button onClick={(e: Event): void => {
            setTheme({
              theme: theme.theme === themes.light ? themes.dark : themes.light
            });
            e.preventDefault();
          }}>ToggleTheme</Button>
        </div>
        <div>
          <a href="javascript:;" onClick={(e: Event) => {
            setRouteIndex(0);
            e.preventDefault();
          }}>List</a>
          &nbsp;
          <a href="javascript:;" onClick={(e: Event) => {
            setRouteIndex(1);
            e.preventDefault();
          }}>Count</a>
          &nbsp;
          <a href="javascript:;" onClick={(e: Event) => {
            setRouteIndex(2);
            e.preventDefault();
          }}>Field</a>
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
