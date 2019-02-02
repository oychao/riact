import React from 'react';

import App from './src/components/app';

import './index.less';

console.log(React.render(
  <App color="red">
    <h1>app</h1>
  </App>,
  document.querySelector('#app')
));


// var h = require('virtual-dom/h');
// var diff = require('virtual-dom/diff');
// var patch = require('virtual-dom/patch');
// var createElement = require('virtual-dom/create-element');

// const React =  {
//   createElement: h
// };

// // 1: Create a function that declares what the DOM should look like
// function render(count)  {
//   if (count === 0) {
//     return (
//       <div>
//         <ul>
//           <li>hilitag@par.kh</li>
//           <li>at@pi.ee</li>
//           <li>bog@akeditpu.sd</li>
//           <li>efgu@les.sa</li>
//         </ul>
//       </div>
//     );
//     // return h('div', {
//     //   style: {}
//     // }, [h('h1', { key: 'h1' }, 'h1'), h('h2', { key: 'h2-1' }, 'h2-1'), h('h3', {  key: 'h3' }, 'h3'), h('h4', { key: 'h4' }, 'h4')]);
//   } else {
//     return h('div', {
//       style: {}
//     }, [h('h1', { key: 'h1' }, 'h1'), h('h2', { key: 'h2-2' }, 'h2-2'), h('h2', {  key: 'h2-1' }, 'h2-1'), h('h3', { key: 'h3' }, 'h3'), h('h4', { key: 'h4' }, 'h4')]);
//   }
// }

// // 2: Initialise the document
// var count = 0;      // We need some app data. Here we just store a count.

// var tree = render(count);               // We need an initial tree
// console.log(tree);
// var rootNode = createElement(tree);     // Create an initial root DOM node ...
// document.body.appendChild(rootNode);    // ... and it should be in the document

// // 3: Wire up the update logic
// setTimeout(function () {
//   count++;
//   var newTree = render(count);
//   var patches = diff(tree, newTree);
//   rootNode = patch(rootNode, patches);
//   tree = newTree;
// }, 2e3);
