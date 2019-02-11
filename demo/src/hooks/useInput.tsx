import { useState } from 'riact';

const useInput = function(initValue: string | number) {
  const [value, setValue] = useState(initValue);
  const onInput = function(e: Event) {
    setValue((e.target as HTMLInputElement).value);
    e.preventDefault();
  };

  return {
    value,
    onInput,
    setValue
  };
};

export default useInput;
