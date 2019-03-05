import {
  useState
} from 'riact';

const useReducer = function (reducer) {
  const [state, setState] = useState(reducer(undefined, {
    type: undefined
  }));
  return {
    state,
    dispatch: action => {
      setState(reducer(state, action));
    }
  };
};

export default useReducer;