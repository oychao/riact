import {
  useState,
  useEffect
} from 'riact';

const useRouter = config => {
  const [path, setPath] = useState('/');

  const refresh = () => {
    setPath(location.hash.slice(1) || '/');
  };

  useEffect(() => {
    window.addEventListener('load', refresh, false);
    window.addEventListener('hashchange', refresh, false);
    return () => {
      window.removeEventListener('load', refresh);
      window.removeEventListener('hashchange', refresh);
    };
  }, []);

  return config.get(`${path}`);
};

export default useRouter;
