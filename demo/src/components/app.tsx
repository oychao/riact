import React, { useState } from 'react';

const App = function(props: common.TStrValObject) {
  const [ title, setTitle ] = useState('Hello World');
  const [ count, setCount ] = useState(1);
  // setTimeout(() => {
  //   setTitle(`${title} ${count}`);
  //   setCount(count + 1);
  // }, 1e3);
  return (
    <div color={props.color}>
      <h2>{title}</h2>
      {props.children}
    </div>
  );
};

export default App;
