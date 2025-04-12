import { Fragment, useMemo } from 'react';
import { Shortcuts } from '@shared/types/shortcut-types';

import Switch from '@/components/ui/Switch';
import Kbd from '@/components/ui/Kbd/Kbd';
import { resolveShortCutToKbd } from '@/utils/kbd';
import { usePlatform } from '@/queries/usePlatform';

type Props = {
  shortcut: Shortcuts[number];
  onChangeTargetKey: (key: string) => void;
  onChangeShortcut: (key: string, value: string, enabled?: boolean) => void;
};

const ShortCutItem = ({
  shortcut,
  onChangeShortcut,
  onChangeTargetKey,
}: Props) => {
  const platform = usePlatform();
  const keys = useMemo(
    () => (platform ? resolveShortCutToKbd(shortcut.value, platform) : []),
    [platform, shortcut.value]
  );
  return (
    <div
      key={shortcut.key}
      className={'flex items-center justify-between text-sm'}
    >
      <section className={'flex flex-col gap-1'}>
        <h3>{shortcut.label}</h3>
        <span className={'text-xs text-neutral-500'}>
          {shortcut.description}
        </span>
      </section>
      <section className={'flex items-center gap-4'}>
        <div
          className={
            'flex min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-md bg-neutral-900 p-2 hover:bg-neutral-900/80'
          }
          onClick={() => {
            onChangeTargetKey(shortcut.key);
          }}
        >
          {keys.map((key, i) => (
            <Fragment key={key}>
              <Kbd>{key}</Kbd>
              {i !== keys.length - 1 && '+'}
            </Fragment>
          ))}
        </div>
        <Switch
          value={shortcut.enabled}
          onChange={(v) => onChangeShortcut(shortcut.key, shortcut.value, v)}
        />
      </section>
    </div>
  );
};

export default ShortCutItem;
