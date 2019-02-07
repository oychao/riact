import React, { useState } from 'react';

import ThemeContext, { themes } from '../context/theme';
import Count from './count';
import Field from './field';
import List from './list';

const App = function(props: common.TStrValObject): JSX.Element {
  const [ routeIndex, setRouteIndex ] = useState(0);
  const [ count, setCount ] = useState(1);
  
  const RouteComponents: Array<JSX.Element> = [
    <List></List>,
    <Count stateCount={[ count, setCount ]} ></Count>,
    <Field></Field>,
  ];

  return (
    <div color={props.color}>
      <ThemeContext.Provider value={themes.light}>
        <h1>Hello My-React</h1>
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
