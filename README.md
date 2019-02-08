# Riact

A simplified React-like MVVM framework.

# How to use

Check the [demo][1] above.

## Component

Currently function component supported only.

```javascript
// ./Count.jsx
import React, { useState } from 'riact';

const Count = function() {
  const [ value, setValue ] = useState(0); // exactly like hooks in React 16.8.
  setTimeout(setValue, 1e3, value + 1); // be careful when using hooks in timer function, it's kind of tricky.
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

## Supported Feature / API

1. useState(initStateValue);
2. React.createRef();
3. React.createContext(initContextValue);
   1. Context.Provider
   2. Context.Consumer
4. React.memo(FunctionComponent);

# FYI

**NOTE**: Riact is just for learning modern MVVM framework, it's easy and simple, so DO NOT use it in complex application development, or I wish you LUCK.

# LICENCE

[![](http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-badge-4.png)](http://www.wtfpl.net/)

[1]: https://github.com/oychao/riact/tree/master/demo
