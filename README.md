# Riact

A simplified React-like MVVM framework.

[![Build Status](https://travis-ci.org/oychao/riact.svg?branch=master)](https://travis-ci.org/oychao/riact)

## How to use

Check the [demo][1] above.

### Component

Currently function component supported only.

```javascript
// ./Count.jsx
import React, { useState, useEffect } from 'riact';

const Count = function() {
  const [ value, setValue ] = useState(0); // exactly like hooks in React 16.8.
  setTimeout(setValue, 1e3, value + 1); // be careful when using hooks in timer function, it's kind of tricky.
  useEffect(() => void (console.log(value))); // useEffect basic usage
  return (
    <div>
      <p>{value}</p>
    </div>
  );
};

export default Count;
```

```javascript
// ./app.jsx
import ReactDOM from 'riact';
import Count from './Count';

ReactDom.render(<Count></Count>, document.querySelector('#app'));
```

### Supported Feature / API

1. useState(initStateValue);
2. useEffect(effectCallback);
3. useContext(contextComp);
4. React.createRef();
5. React.createContext(initContextValue);
   1. Context.Provider
   2. Context.Consumer
6. React.memo(FunctionComponent);

## FYI

**NOTE**: Riact is just for learning, it's easy and simple so DO NOT use it to develop complex application, otherwise I wish you LUCK.

## LICENCE

[GLWTPL](https://github.com/me-shaon/GLWTPL)

[1]: https://github.com/oychao/riact/tree/master/demo
