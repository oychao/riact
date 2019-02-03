import React from 'react';

const Red = function(props) {
  console.log(props);
  return (
    <h4 class="app-red">{props.val}</h4>
  );
};

export default Red;
