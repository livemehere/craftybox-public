import { useEffect, useState } from 'react';
import useStore from '@shared/Store/react/useStore';
import { Shortcuts } from '@shared/types/shortcut-types';
import { STORE_KEY_MAP } from '@shared/constants';
import { produce } from 'immer';

import useCaptureInput from '@/hooks/useCaptureInput';
import { usePlatform } from '@/queries/usePlatform';
import { ShortCutInputOverlay } from '@/features/settings/components/shortcuts/ShortCutInputOverlay';
import ShortCutItem from '@/features/settings/components/shortcuts/ShortCutItem';

const ShortcutList = () => {
  const { data: platform } = usePlatform();
  const [changeTarget, setChangeTarget] = useState<string | null>(null);
  const { data: shortcuts, setData: setShortcuts } = useStore<Shortcuts>(STORE_KEY_MAP.shortcuts, []);

  const { curChar, reset } = useCaptureInput({
    active: !!changeTarget,
    onEnd: (v) => {
      if (changeTarget) {
        onChangeShortcut(changeTarget, v, true);
      }
      setChangeTarget(null);
    }
  });

  useEffect(() => {
    if (curChar === 'Escape') {
      reset();
      setChangeTarget(null);
    }
  }, [curChar]);

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

  return (
    <>
      {changeTarget && <ShortCutInputOverlay char={curChar} />}
      <div className={'flex flex-col gap-6'}>
        {shortcuts?.map((shortcut) => {
          return (
            <ShortCutItem
              key={shortcut.key}
              shortcut={shortcut}
              onChangeShortcut={onChangeShortcut}
              onChangeTargetKey={setChangeTarget}
              platform={platform}
            />
          );
        })}
      </div>
    </>
  );
};

export default ShortcutList;
