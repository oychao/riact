declare module '*.svg' {
  const content: any;
  export default content;
}

declare type TAction = {
  type: string;
  payload?: any;
};

declare type TReducer<T> = (action: TAction, state: T) => T;
