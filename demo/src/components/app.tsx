import React, { useState } from 'react';

import Red from './red';

const App = function(props: common.TStrValObject): JSX.Element {
  const [ title, setTitle ] = useState('Count');
  const [ count, setCount ] = useState(1);
  if (count % 2 === 0) {
    setTimeout(() => {
      // setTitle(`${title} ${count}`);
      setCount(count + 1);
    }, 1e3);
  }
  
  return (
    <div color={props.color}>
      <h1>Hello World</h1>
      <h2 style={{ color: 'purple' }}>{title + ' ' + count}</h2>
      {count % 2 === 1 ? <Red stateCount={[ count, setCount ]}></Red> : null}
      {props.children}
    </div>
  );
};

export default App;
