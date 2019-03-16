import Riact from 'riact';

import useLifeCycleChecker from '../hooks/useLifeCycleChecker';
import useInputModel from '../hooks/useInputModel';

const Profile = function() {
  useLifeCycleChecker('Profile');
  const { model: firstNameModel } = useInputModel('Chao');
  const { model: lastNameModel } = useInputModel('Ouyang');
  return (
    <div>
      <input type="text" {...firstNameModel} />
      <input type="text" {...lastNameModel} />
      <div>{firstNameModel.value + ' ' + lastNameModel.value}</div>
    </div>
  );
};

export default Profile;
