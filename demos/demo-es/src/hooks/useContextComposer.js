import F from 'f';

const useContextComposer = function(...args) {
  if (args.length === 0) {
    return null;
  }
  const InitContext = args.pop();
  return function ComposedContext({ children, values }) {
    return args.reduceRight((Acc, Context, index) => {
      return <Context.Provider value={values[index]}>{Acc}</Context.Provider>;
    }, <InitContext.Provider value={values[args.length]}>{children}</InitContext.Provider>);
  };
};

export default useContextComposer;
