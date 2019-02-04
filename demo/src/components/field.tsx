import React, { useState, createRef } from 'react';

const Field = function(props: common.TObject): JSX.Element {
  const [ refInput ] = useState(createRef());
  const [ value, setValue ] = useState('');
  return (
    <div>
      <input ref={refInput} onInput={(e: Event): void => {
        // console.log((refInput.current as HTMLInputElement).value);
        setValue((refInput.current as HTMLInputElement).value);
        e.preventDefault();
      }} value={value} />
      <div style={{ color: 'grey' }}>{value}</div>
    </div>
  );
};

export default Field;
