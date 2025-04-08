import { Fragment } from 'react';

import { resolveShortCutToKbd } from '@/utils/kbd';
import { usePlatform } from '@/queries/usePlatform';

import Kbd from './Kbd';

const SimpleKbd = ({ keyString }: { keyString: string }) => {
  const { data: platform } = usePlatform();
  const keys = resolveShortCutToKbd(keyString, platform);

  return (
    <div>
      {keys.map((key, i) => (
        <Fragment key={key}>
          <Kbd>{key}</Kbd>
          {i !== keys.length - 1 && '+'}
        </Fragment>
      ))}
    </div>
  );
};

export default SimpleKbd;
