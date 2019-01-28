import React from 'react';

import App from './src/components/app';

import './index.less';

React.render(
  <App color="red">
  {
    [1,2,3].map(i => <div key={i}></div>)
  }
  </App>,
  document.querySelector('#app')
);
