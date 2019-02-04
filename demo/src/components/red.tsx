import React from 'react';

const Red = function(props) {
  return (
    <h3 className={['app-red']}>{props.val.value}</h3>
  );
};

export default Red;
