import { Fragment, useMemo } from 'react';
import { TUserShortcutSettings } from '@shared/types/shortcut-types';
import { getShortcutMeta } from '@shared/meta/shortcuts';
import { Switch } from '@heroui/react';

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
      className={'flex items-center justify-between px-6 py-8'}
    >
      <section className={'flex flex-col gap-2'}>
        <h3 className={'typo-body1'}>{meta.label}</h3>
        <span className={'text-app-tertiary typo-body2'}>
          {meta.description}
        </span>
      </section>

      <section className={'flex items-center gap-14'}>
        <div
          className={
            'flex min-w-200 cursor-pointer items-center justify-center gap-6 rounded-md bg-neutral-800/70 p-4 hover:bg-neutral-800/50'
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
          onChange={(e) =>
            onChangeShortcut(shortcut.key, shortcut.value, e.target.checked)
          }
        />
      </section>
    </div>
  );
};

export default ShortCutItem;
