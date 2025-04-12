import { useState } from 'react';

import WithBreadcrumb from '@/components/WithBreadcrumb';

export default function HomePage() {
  const [_, setState] = useState();
  return (
    <WithBreadcrumb items={[{ name: '홈', path: '/' }]}>
      <div
        className={'page-wrapper flex items-center justify-center text-sm'}
        data-testid="home-page"
      >
        <h1>CraftyBox</h1>
        <button
          onClick={() =>
            setState(() => {
              throw 1;
            })
          }
        >
          ERROR
        </button>
      </div>
    </WithBreadcrumb>
  );
}
