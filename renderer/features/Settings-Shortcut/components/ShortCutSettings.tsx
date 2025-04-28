import { useEffect, useState } from 'react';
import { produce } from 'immer';
import useStore from '@shared/Store/react/useStore';
import { TUserShortcutSettings } from '@shared/types/shortcut-types';
import { STORE_KEY_MAP } from '@shared/constants';

import { ShortCutInputOverlay } from '@/features/Settings-Shortcut/components/ShortCutInputOverlay';
import useCaptureInput from '@/features/Settings-Shortcut/hooks/useCaptureInput';

import ShortCutItem from './ShortCutItem';

export default function ShortCutSettings() {
  const { data: shortcuts, setData: setShortcuts } =
    useStore<TUserShortcutSettings>(STORE_KEY_MAP.shortcuts, []);

  const [changeTarget, setChangeTarget] = useState<string | null>(null);
  const { curChar, reset } = useCaptureInput({
    active: !!changeTarget,
    onEnd: (v) => {
      if (changeTarget) {
        onChangeShortcut(changeTarget, v, true);
      }
      setChangeTarget(null);
    },
  });

  const onChangeShortcut = (key: string, value: string, enabled?: boolean) => {
    setShortcuts(
      produce((draft) => {
        const shortcut = draft?.find((s) => s.key === key);
        if (shortcut) {
          shortcut.value = value;
          shortcut.enabled = enabled ?? shortcut.enabled;
        }
      })
    );
  };

  useEffect(() => {
    if (curChar === 'Escape') {
      reset();
      setChangeTarget(null);
    }
  }, [curChar]);

  return (
    <div>
      {changeTarget && <ShortCutInputOverlay char={curChar} />}
      <div className={'flex flex-col gap-24'}>
        {shortcuts?.map((shortcut) => {
          return (
            <ShortCutItem
              key={shortcut.key}
              shortcut={shortcut}
              onChangeShortcut={onChangeShortcut}
              onChangeTargetKey={setChangeTarget}
            />
          );
        })}
      </div>
    </div>
  );
}
