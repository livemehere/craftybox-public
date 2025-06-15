import { Fragment, useMemo } from 'react';
import { TUserShortcutSettings } from '@shared/types/shortcut-types';
import { getShortcutMeta } from '@shared/meta/shortcuts';
import { Switch } from '@heroui/react';
import { addToast } from '@heroui/toast';

import Kbd from '@/components/Kbd/Kbd';
import { resolveShortCutToKbd } from '@/utils/kbd';
import { usePlatform } from '@/queries/usePlatform';

type Props = {
  shortcut: TUserShortcutSettings[number];
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

  const meta = getShortcutMeta(shortcut.key);

  return (
    <div
      key={shortcut.key}
      className={'flex items-center justify-between px-1.5 py-2'}
    >
      <section className={'flex flex-col gap-0.5'}>
        <h3>{meta.label}</h3>
        <span className={'text-app-tertiary'}>{meta.description}</span>
      </section>
      <section className={'flex items-center gap-3.5'}>
        <div
          className={
            'flex min-w-[200px] cursor-pointer items-center justify-center gap-1.5 rounded-md bg-neutral-800/70 p-2 hover:bg-neutral-800/50'
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
          isSelected={shortcut.enabled}
          onChange={(e) => {
            const { checked } = e.target;
            onChangeShortcut(shortcut.key, shortcut.value, checked);
            addToast({
              title: meta.label,
              description: checked ? 'enabled' : 'disabled',
              color: checked ? 'primary' : 'default',
              icon: checked ? 'check' : 'cross',
            });
          }}
        />
      </section>
    </div>
  );
};

export default ShortCutItem;
