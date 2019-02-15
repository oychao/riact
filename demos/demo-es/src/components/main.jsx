import F, { useContext } from 'f';

import ThemeContext, { themes } from '../context/theme';
import UserContext from '../context/user';

const Main = F.memo(function(props) {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  return (
    <div>
      <span>{user}</span>
      <button style={{...theme.value}} onClick={() => {
        theme.setTheme(theme.value === themes.light ? themes.dark : themes.light);
      }}>toggle theme</button>
    </div>
  );
});

export default Main;
