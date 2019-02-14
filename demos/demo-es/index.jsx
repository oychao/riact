import F from 'f';

import App from './src/components/app';

import './index.less';

// document.querySelector('#root').innerHTML = '<h1>Pretent to be a modern front-end App</h1>';

F.render(
  <App />,
  document.querySelector('#root')
);
