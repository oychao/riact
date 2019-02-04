import React, { useState } from 'react';

import Red from './red';

const App = function(props: common.TStrValObject) {
  const [ title, setTitle ] = useState('Hello World');
  const [ count, setCount ] = useState(1);
  setTimeout(() => {
    // setTitle(`${title} ${count}`);
    setCount(count + 1);
  }, 1e3);
  return (
    <div color={props.color}>
      <h1>{title + ' ' + count}</h1>
      {count % 2 === 1 ? <Red val={{ value: 'gaga' }}></Red> : <h4>haha</h4>}
      {props.children[0]}
    </div>
  );
};

export default App;
