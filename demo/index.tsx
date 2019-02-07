import React from 'riact';

import App from './src/components/app';

import './index.less';

console.log(React.render(
  <App color="red"></App>,
  document.querySelector('#app')
));
