import F, { useState, useEffect, useContext } from 'f';

const useInputModel = function(initValue) {
  const [value, setValue] = useState(initValue);
  return {
    value,
    onInput: e => {
      setValue(e.target.value);
    }
  };
};

const useRouter = function(routers) {
  const [index, setIndex] = useState(0);
  const activeRoute = routers[index];
  return [
    <div>
      {routers.map(([name], curIdx) => (
        <span>
          <a
            style={curIdx === index ? { color: 'red' } : {}}
            href="javascript:;"
            onClick={() => setIndex(curIdx)}
          >
            {name}
          </a>
          &nbsp;
        </span>
      ))}
    </div>,
    activeRoute[1]
  ];
};

const useReducer = function(reducer) {
  const [state, setState] = useState(reducer(undefined, { type: undefined }));
  return {
    state,
    dispatch: action => {
      setState(reducer(state, action));
    }
  };
};

const themes = {
  light: { color: 'black', backgroundColor: 'white' },
  dark: { color: 'white', backgroundColor: 'black' }
};
const ThemeContext = F.createContext(themes.light);

const ThemedButton = function({ children, onClick }) {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ ...theme }} onClick={onClick}>
      {children}
    </button>
  );
};

const Header = function({ toggleTheme }) {
  return (
    <div>
      <h1>Hello World</h1>
      <ThemedButton onClick={toggleTheme}>toggle theme</ThemedButton>
    </div>
  );
};

const Profile = function() {
  const firstNameModel = useInputModel('Chao');
  const lastNameModel = useInputModel('Ouyang');
  return (
    <div>
      <input type="text" {...firstNameModel} />
      <input type="text" {...lastNameModel} />
      <div>{firstNameModel.value + ' ' + lastNameModel.value}</div>
    </div>
  );
};

const Count = function() {
  const [num, setNum] = useState(2);
  return (
    <div>
      <ThemedButton onClick={() => setNum(num - 1)}>-</ThemedButton>
      <span>{num}</span>
      <ThemedButton onClick={() => setNum(num + 1)}>+</ThemedButton>
    </div>
  );
};

const List = function() {
  const valueModel = useInputModel('');
  const { state, dispatch } = useReducer(function(state = { list: [] }, action) {
    const newState = Object.assign({}, state);
    switch(action.type) {
    case 'ADD':
      if (Array.isArray(action.payload)) {
        newState.list = newState.list.concat(action.payload);
      } else {
        newState.list.push(action.payload);
      }
      break;
    default:;
    }
    return newState;
  });
  const { list } = state;
  useEffect(() => {
    new Promise(resolve => {
      setTimeout(() => {
        resolve([
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
    });
  }, []);
  return (
    <div>
      <input type="text" {...valueModel}/>
      <ThemedButton onClick={() => {
        dispatch({
          type: 'ADD',
          payload: valueModel.value
        });
      }}>add item</ThemedButton>
      <ol>
        {list.length === 0
          ? 'loading'
          : list.map(item => <li key={item}>{item}</li>)}
      </ol>
    </div>
  );
};

const la = [{
  name: 'Derek Floyd',
  email: 'bih@usovov.cg'
}, {
  name: 'Willie Hill',
  email: 'jiujhe@niz.ac'
}, {
  name: 'Max Gilbert',
  email: 'ger@efelu.dz'
}, {
  name: 'David Fuller',
  email: 'ruru@hijo.aw'
}];
const lb = [{
  name: 'Willie Hill',
  email: 'jiujhe@niz.ac'
}, {
  name: 'Max Gilbert',
  email: 'ger@efelu.dz'
}, {
  name: 'Derek Floyd',
  email: 'bih@usovov.cg'
}, {
  name: 'Abbie Garza',
  email: 'ruru@hijo.aw'
}, {
  name: 'Lucy Dennis',
  email: 'ekgiov@upeukgo.pe'
}];
const ShowList = function() {
  const [list, setList] = useState(la);
  setTimeout(() => {
    setList(list === la ? lb : la);
  }, 1e3);
  return (
    <ol>
      {list.map(({name, email}) => <li key={email}>{name}</li>)}
    </ol>
  );
};

const App = function() {
  const [links, activeRoute] = useRouter([
    ['show list', <ShowList />],
    ['count', <Count />],
    ['profile', <Profile />],
    ['list', <List />]
  ]);
  const [theme, setTheme] = useState(themes.light);
  return (
    <div>
      <ThemeContext.Provider value={theme}>
        <Header
          toggleTheme={() => {
            setTheme(theme === themes.light ? themes.dark : themes.light);
          }}
        />
        {links}
        <hr />
        {activeRoute}
      </ThemeContext.Provider>
    </div>
  );
};

export default App;
