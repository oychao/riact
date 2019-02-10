import React, { useState } from 'riact';

type Route = {
  name: string;
  component: Riact.TFuncComponent;
  props?: any
};

const useRouter = function(routes: Array<Route>) {
  const [routeIndex, setRouteIndex] = useState(0);
  const ActiveComp = routes[routeIndex].component;
  return {
    links: routes.map((route, idx) => (
      <span key={route.name}>
        <a href="javascript:;" onClick={() => setRouteIndex(idx)}>
          {route.name}
        </a>
        &nbsp;
      </span>
    )),
    activeComp: <ActiveComp {...routes[routeIndex].props}></ActiveComp>
  };
};

export default useRouter;
