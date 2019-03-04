import Riact, { useState } from 'riact';

import useLifeCycleChecker from '../hooks/useLifeCycleChecker';

const la = [
  {
    name: 'a',
    email: 'a'
  },
  {
    name: 'b',
    email: 'b'
  },
  {
    name: 'c',
    email: 'c'
  },
  {
    name: 'd',
    email: 'd'
  }
];
const lb = [
  {
    name: 'e',
    email: 'e'
  },
  {
    name: 'hahaha',
    email: 'a'
  },
  {
    name: 'd',
    email: 'd'
  },
  {
    name: 'b',
    email: 'b'
  },
  {
    name: 'c',
    email: 'c'
  }
];
const Item = function({ children }) {
  useLifeCycleChecker('Item');
  return (
    <>
      <li>{children}</li>
    </>
  );
};
const ShowList = function() {
  useLifeCycleChecker('ShowList');
  const [list, setList] = useState(la);
  setTimeout(() => {
    setList(list === la ? lb : la);
  }, 1e3);
  return (
    <ol>
      {list.map(({ name, email }) => (
        <Item key={email}>{name}</Item>
      ))}
    </ol>
  );
};

export default ShowList;
