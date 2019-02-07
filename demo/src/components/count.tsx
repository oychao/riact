import React from 'riact';

import Button from './button';

const Count = function(props: Riact.TObject): JSX.Element {
  const { stateCount: [count, setCount] } = props;
  return (
    <div>
      <Button onClick={(e: Event): void => {
        setCount(count - 1);
      }} className={['app-red']}>-</Button>
      <Button onClick={(e: Event): void => {
        setCount(count + 1);
      }} className={['app-red']}>+</Button>
      <br/>
      <span>{count}</span>
    </div>
  );
};

export default Count;
