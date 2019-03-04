import Riact, { useState } from 'riact';

const useRouter = function(routers) {
  const [index, setIndex] = useState(0);
  const activeRoute = routers[index];
  return [
    <div>
      {routers.map(([name], curIdx) => (
        <span key={curIdx}>
          <a
            key={curIdx}
            style={curIdx === index ? { color: 'red' } : {}}
            href="javascript:;"
            onClick={() => {
              setIndex(curIdx);
            }}
          >
            {name}
          </a>
          &nbsp;
        </span>
      ))}
    </div>,
    activeRoute[1]
  ];
};

export default useRouter;
