import React from 'react';

const Red = function(props: common.TObject): JSX.Element {
  const { stateCount: [count, setCount] } = props;
  return (
    <h3 onClick={(e: Event): void => {
      setCount(count + 1);
      e.preventDefault();
    }} className={['app-red']}>{count}</h3>
  );
};

export default Red;
