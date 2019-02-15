import { useState } from 'riact';

const useReducer = function<T>(reducer: TReducer<T>, initialState: T) {
  const [state, setState] = useState(initialState);

  return [
    state,
    function dispatch(action: TAction) {
      setState(reducer(action, state));
    }
  ];
};

export default useReducer;
