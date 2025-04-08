import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import log from 'electron-log/renderer';

import { cn } from '@/utils/cn';
interface ErrorResponse {
  status: number;
  statusText: string;
  internal: true;
  data: string;
  error: Error;
}

const logger = log.scope('ErrorPage');

/**
 * Only for development, production should redirect to home page
 */
export default function ErrorPage() {
  const error = useRouteError() as ErrorResponse | Error;
  useEffect(() => {
    logger.error(error);
  }, [error]);

  return (
    <div
      className={cn(
        'flex h-screen flex-col items-center justify-center gap-4 bg-neutral-950',
        '[&>h1]:text-2xl [&>h1]:font-bold'
      )}
      data-testid="not-found-page"
    >
      <ErrorContent error={error} />
      <button
        className="rounded bg-neutral-900 px-8 py-4 hover:bg-neutral-800"
        onClick={() => (window.location.href = '/')}
      >
        Reload
      </button>
    </div>
  );
}

function ErrorContent({ error }: { error: ErrorResponse | Error | unknown }) {
  if (isRouteErrorResponse(error)) {
    return (
      <h1>
        {error.status} {import.meta.env.DEV ? error.statusText : ''}
      </h1>
    );
  } else if (error instanceof Error) {
    return <h1>{import.meta.env.DEV ? error.message : 'Error'}</h1>;
  } else {
    return <h1>Error</h1>;
  }
}
