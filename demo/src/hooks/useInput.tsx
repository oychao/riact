import { useState } from 'riact';

type TInputHook = {
  value: string | number;
  onInput: (e: Event) => void;
};

const useInput = function(initValue: string | number): TInputHook {
  const [value, setValue] = useState(initValue);
  const onInput = function(e: Event) {
    setValue((e.target as HTMLInputElement).value);
    e.preventDefault();
  };

  return {
    value,
    onInput
  };
};

export default useInput;
