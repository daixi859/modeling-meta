import { useCallback, useState } from 'react';

const isFunction = (value: unknown): value is Function => typeof value === 'function';

export type SetState<S extends Record<string, unknown>> = <K extends keyof S>(
  state: Pick<S, K> | null | ((prevState: Readonly<S>) => Pick<S, K> | S | null)
) => void;

const useSetState = <S extends Record<string, unknown>>(
  initialState: S | (() => S)
): [S, SetState<S>] => {
  const [state, setState] = useState<S>(initialState);

  const setMergeState = useCallback((patch: unknown) => {
    setState((prevState) => {
      const newState = isFunction(patch) ? patch(prevState) : patch;
      return newState ? { ...prevState, ...newState } : prevState;
    });
  }, []);

  return [state, setMergeState];
};

export default useSetState;
