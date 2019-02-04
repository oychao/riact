import React from 'react';

import App from './src/components/app';

import './index.less';

console.log(React.render(
  <App color="red">
    <h4>app</h4>
  </App>,
  document.querySelector('#app')
));
