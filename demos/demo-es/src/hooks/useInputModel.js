import {
  useState
} from 'riact';

const useInputModel = function (initValue) {
  const [value, setValue] = useState(initValue);
  return {
    model: {
      value,
      onChange: e => {
        setValue(e.target.value);
      }
    },
    setValue
  };
};

export default useInputModel;
