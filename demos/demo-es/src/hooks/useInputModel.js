import { useState } from 'riact';

const useInputModel = function(initValue) {
  const [value, setValue] = useState(initValue);
  return {
    model: {
      value,
      onInput: e => {
        setValue(e.target.value);
      }
    },
    setValue
  };
};

export default useInputModel;
