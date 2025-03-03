import { useRef, RefObject } from 'react';

function useControlledRef<T>(externalRef?: RefObject<T>, initialValue?: T) {
  const internalRef = useRef<T>(initialValue as T);

  const ref = externalRef || internalRef;

  return ref as RefObject<T>;
}

export default useControlledRef;
