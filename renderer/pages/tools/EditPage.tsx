import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import {
  rootContainerAtom,
  modeAtom,
  selectedObjAtom,
  hoverObjAtom,
  lockedContainerUidsAtom,
} from 'renderer/features/edit/design/stores';
import { Assets, Container, Sprite } from 'pixi.js';

import PixiProvider from '@/lib/pixi-core/components/PixiProvider';
import PixiCanvas from '@/lib/pixi-core/components/PixiCanvas';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';
import { SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY } from '@/features/edit/schema';
import PixiGrid from '@/lib/pixi-core/components/PixiGrid';
import PixiPanController from '@/lib/pixi-core/components/PixiPanController';
import PixiWheelController from '@/lib/pixi-core/components/PixiWheelController';
import PixiTreeView from '@/lib/pixi-core/components/PixiTreeView/PixiTreeView';
import MutatePanel from '@/features/edit/design/components/MutatePanel';
import PixiExecutor from '@/lib/pixi-core/components/PixiExecutor';
import InteractionController from '@/features/edit/design/components/InteractionController';

const EditPage = () => {
  const open = useAtomValue(lnbOpenAtom);
  const [rootContainer, setRootContainer] = useAtom(rootContainerAtom);
  const setHoverObj = useSetAtom(hoverObjAtom);
  const [selectedObj, setSelectedObj] = useAtom(selectedObjAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const [lockedContainerUids, setLockedContainerUids] = useAtom(
    lockedContainerUidsAtom
  );

  const imgUrl = useMemo(() => {
    const targetUrl = localStorage.getItem(
      SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY
    );
    // localStorage.removeItem(SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY);
    return targetUrl || null;
  }, []);

  return (
    <PixiProvider resizeDeps={[open]}>
      <div className={'relative h-full w-full'}>
        {/** Common */}
        <PixiWheelController enable={true} />
        <PixiPanController enable={mode === 'move'} />
        <PixiGrid
          onCreated={(containers) => {
            setLockedContainerUids((prev) => [
              ...prev,
              ...containers.map((c) => c.uid),
            ]);
          }}
        />
        <PixiCanvas />
        <PixiTreeView
          onHoverContainer={(container) => setHoverObj(container)}
          onClickContainer={(container) => {
            setSelectedObj(container);
            setMode('select');
          }}
          activeContainer={selectedObj}
          onDeleteContainer={(container) => {
            if (container === selectedObj) {
              setSelectedObj(null);
            }
            container.destroy();
          }}
          isLocked={(container) => {
            if (lockedContainerUids.includes(container.uid)) {
              return true;
            }
            return false;
          }}
        />

        {/** Design Edit */}
        <InteractionController target={rootContainer} />
        <MutatePanel target={selectedObj} />
        <PixiExecutor
          cb={(app) => {
            app.stage.x += app.screen.width / 2;
            app.stage.y += app.screen.height / 2;
          }}
        />
        <PixiExecutor
          cb={(app) => {
            let editingContainer: Container | null = null;
            (async () => {
              if (!imgUrl) return;
              const container = new Container();
              container.label = 'Frame';
              setLockedContainerUids((prev) => [...prev, container.uid]);

              const texture = await Assets.load(imgUrl);
              const sprite = new Sprite(texture);
              sprite.label = 'Image';

              // add.
              container.addChild(sprite);
              app.stage.addChild(container);

              // set img center
              sprite.position.set(-texture.width / 2, -texture.height / 2);

              setRootContainer(container);
              editingContainer = container;
            })();
            return () => {
              editingContainer?.destroy();
            };
          }}
          deps={[]}
        />
      </div>
    </PixiProvider>
  );
};

export default EditPage;
