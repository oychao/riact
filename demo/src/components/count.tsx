import React from 'react';

import Button from './button';

const Count = function(props: common.TObject): JSX.Element {
  const { stateCount: [count, setCount] } = props;
  return (
    <div>
      <Button onClick={(e: Event): void => {
        setCount(count - 1);
        e.preventDefault();
      }} className={['app-red']}>-</Button>
      <Button onClick={(e: Event): void => {
        setCount(count + 1);
        e.preventDefault();
      }} className={['app-red']}>+</Button>
      <br/>
      <span>{count}</span>
    </div>
  );
};

export default Count;
