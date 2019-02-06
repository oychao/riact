import React from 'react';

import ThemeContext from '../context/theme';

const Button = function(props: common.TObject): JSX.Element {
  return (
    <ThemeContext.Consumer>
      {(value: any) => {
        console.log(value);
        return <button style={value.theme} onClick={props.onClick}>{props.children}</button>;
      }}
    </ThemeContext.Consumer>
  );
};

export default Button;
