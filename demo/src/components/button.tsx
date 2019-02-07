import React from 'riact';

import ThemeContext from '../context/theme';

const Button = function(props: Riact.TObject): JSX.Element {
  return (
    <ThemeContext.Consumer>
      {(value: any) => {
        return <button style={value.theme} onClick={props.onClick}>{props.children}</button>;
      }}
    </ThemeContext.Consumer>
  );
};

export default Button;
