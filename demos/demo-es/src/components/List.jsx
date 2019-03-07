import Riact, { useState, useEffect } from 'riact';

import useLifeCycleChecker from '../hooks/useLifeCycleChecker';
import useInputModel from '../hooks/useInputModel';
import useReducer from '../hooks/useReducer';

import ThemedButton from './ThemedButton';

const List = function() {
  useLifeCycleChecker('List');
  const { setValue, model: valueModel } = useInputModel('');
  const { state, dispatch } = useReducer(function(
    state = { list: [] },
    action
  ) {
    const newState = Object.assign({}, state);
    switch (action.type) {
    case 'ADD':
      if (Array.isArray(action.payload)) {
        newState.list = newState.list.concat(action.payload);
      } else {
        newState.list.push(action.payload);
      }
      break;
    default:
    }
    return newState;
  });
  const { list } = state;
  useEffect(() => {
    let isCanceled = false;
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        isCanceled ? reject() : resolve([
          'pul@puezne.gg',
          'ike@opgal.an',
          'pat@afued.sz',
          'beswedrel@ja.yt'
        ]);
      }, 5e2);
    }).then(data => {
      dispatch({
        type: 'ADD',
        payload: data
      });
    }).catch(() => {});
    return () => { isCanceled = true; };
  }, []);
  return (
    <div>
      <input type="text" {...valueModel} />
      <ThemedButton
        onClick={() => {
          dispatch({
            type: 'ADD',
            payload: valueModel.value
          });
          setValue('');
        }}
      >
        add item
      </ThemedButton>
      <ol>
        {list.length === 0
          ? 'loading'
          : list.map(item => {
            return <li key={item}>{item}</li>;
          })}
      </ol>
    </div>
  );
};

export default List;
