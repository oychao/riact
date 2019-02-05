import React from 'react';

const Count = function(props: common.TObject): JSX.Element {
  const { stateCount: [count, setCount] } = props;
  return (
    <div>
      <button onClick={(e: Event): void => {
        setCount(count - 1);
        e.preventDefault();
      }} className={['app-red']}>-</button>
      <button onClick={(e: Event): void => {
        setCount(count + 1);
        e.preventDefault();
      }} className={['app-red']}>+</button>
      <br/>
      <span>{count}</span>
    </div>
  );
};

export default Count;
