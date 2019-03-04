import Riact, { useState } from 'riact';

import useLifeCycleChecker from '../hooks/useLifeCycleChecker';

import ThemedButton from './ThemedButton';

const Count = function() {
  useLifeCycleChecker('Count');
  const [num, setNum] = useState(2);
  return (
    <div>
      <ThemedButton onClick={() => setNum(num - 1)}>-</ThemedButton>
      <span>{num}</span>
      <ThemedButton onClick={() => setNum(num + 1)}>+</ThemedButton>
    </div>
  );
};

export default Count;
