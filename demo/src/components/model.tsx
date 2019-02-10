import React from 'riact';
import useInput from 'src/hooks/useInput';

const InputModel = function(props: Riact.TObject): JSX.Element {
  const inputHook = useInput('');
  return (
    <div>
      <input {...inputHook} />
      <div style={{ color: 'grey' }}>{inputHook.value}</div>
    </div>
  );
};

export default InputModel;
