import React from 'react';

const App = function(props: common.TStrValObject) {
  return (
    <div color={props.color}>
      {props.children}
    </div>
  );
};

export default App;
