import { createContext, useContext, useEffect, useState } from 'react';

interface Logger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

const noop: Logger = {
  log: console.log,
  error: console.error,
};

export const LoggerContext = createContext<Logger>(noop);
export const useLogger = () => useContext(LoggerContext);

export function LoggerProvider({ children }: { children: React.ReactNode }) {
  const [logger, setLogger] = useState<Logger>(noop as Logger);

  useEffect(() => {
    import('electron-log/renderer')
      .then(({ default: logger }) => {
        setLogger({
          log: logger.log,
          error: logger.error,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>
  );
}
