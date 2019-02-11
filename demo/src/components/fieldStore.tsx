import React from 'riact';

import useInput from '../hooks/useInput';
import useReducer from '../hooks/useReducer';

import Button from './button';

const reducer = function(action: TAction, state: any) {
  const newState = Object.assign({}, state);
  switch (action.type) {
    case 'ADD':
      newState.list.push(action.payload);
      break;
    case 'CLEAR':
      newState.list = [];
      break;
    default:
  }
  return newState;
};

const FieldStore = function(props: Riact.TObject): JSX.Element {
  const inputHook = useInput('');
  const [state, dispatch] = useReducer(reducer, {
    list: []
  });
  return (
    <div>
      <input type="text" {...inputHook} />
      <Button onClick={() => {
        dispatch({
          type: 'ADD',
          payload: inputHook.value
        });
        inputHook.setValue('');
      }}>Add</Button>
      <Button onClick={() => {
        dispatch({
          type: 'CLEAR'
        });
      }}>Clear</Button>
      <ul>
        {state.list.map((item: string): JSX.Element => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
};

export default FieldStore;
