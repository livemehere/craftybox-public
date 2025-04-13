import {
  ElectronBuddyInvokeMap,
  rendererIpc,
} from '@electron-buddy/ipc/renderer';
import { useEffect, useState } from 'react';

export default function useInvoke<
  C extends keyof ElectronBuddyInvokeMap,
  P extends ElectronBuddyInvokeMap[C]['payload'],
>(channel: C, payload: P) {
  const [response, setResponse] =
    useState<ElectronBuddyInvokeMap[C]['response']>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);

  const invoke = async () => {
    setLoading(true);
    try {
      const response = await rendererIpc.invoke(channel, payload);
      setResponse(response);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    invoke();
  }, []);

  return {
    data: response,
    error,
    loading,
    refetch: invoke,
  };
}
