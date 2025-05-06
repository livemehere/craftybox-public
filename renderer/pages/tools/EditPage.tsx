import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import {
  rootContainerAtom,
  modeAtom,
  selectedContainerAtom,
  hoverContainerAtom,
  lockedContainerUidsAtom,
  outlineContainerAtom,
} from 'renderer/features/edit/design/stores';
import { Assets, Container, Graphics, Sprite } from 'pixi.js';

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
import { onHover } from '@/lib/pixi-core/utils/hover';

const EditPage = () => {
  const open = useAtomValue(lnbOpenAtom);
  const [rootContainer, setRootContainer] = useAtom(rootContainerAtom);
  const [selectedContainer, setSelectedContainer] = useAtom(
    selectedContainerAtom
  );
  const [outlineContainer, setOutlineContainer] = useAtom(outlineContainerAtom);
  const [hoverContainer, setHoverContainer] = useAtom(hoverContainerAtom);
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

  const addLock = (...containers: Container[]) => {
    setLockedContainerUids((prev) => [
      ...prev,
      ...containers.map((c) => c.uid),
    ]);
  };

  return (
    <PixiProvider resizeDeps={[open]}>
      <div className={'relative h-full w-full'}>
        {/** Common */}
        <PixiWheelController enable={true} />
        <PixiPanController enable={mode === 'move'} />
        <PixiGrid
          onCreated={(containers) => {
            addLock(...containers);
          }}
        />
        <PixiCanvas />
        <PixiTreeView
          onHoverContainer={(container) => setHoverContainer(container)}
          onClickContainer={(container) => {
            setSelectedContainer(container);
            setMode('select');
          }}
          activeContainer={selectedContainer}
          onDeleteContainer={(container) => {
            if (container === selectedContainer) {
              setSelectedContainer(null);
            }
            container.destroy();
          }}
          isLocked={(container) => {
            return lockedContainerUids.includes(container.uid);
          }}
          displayFilter={(container) => {
            return container !== outlineContainer;
          }}
        />

        {/** Design Edit */}
        <InteractionController rootContainer={rootContainer} />
        <MutatePanel target={selectedContainer} />
        {/* outline navigator */}
        <PixiExecutor
          cb={(app) => {
            if (!hoverContainer) return;
            const outline = new Graphics();
            outline.label = 'Outline';
            app.stage.addChild(outline);
            setOutlineContainer(outline);

            const { x, y, width, height } = hoverContainer;
            outline.rect(0, 0, width, height).stroke({
              width: 1,
              color: '#04cd85',
              pixelLine: true,
            });
            outline.position.set(x, y);

            return () => {
              outline.destroy();
            };
          }}
          deps={[hoverContainer]}
        />
        <PixiExecutor
          cb={(app) => {
            app.stage.x += app.screen.width / 2;
            app.stage.y += app.screen.height / 2;
          }}
        />
        <PixiExecutor
          cb={(app) => {
            let editingContainer: Container | null = null;
            const clears: (() => void)[] = [];

            (async () => {
              if (!imgUrl) return;
              const container = new Container();
              container.label = 'Root Frame';
              setLockedContainerUids((prev) => [...prev, container.uid]);

              const texture = await Assets.load(imgUrl);
              const sprite = new Sprite(texture);
              sprite.label = 'Snapshot';

              // add.
              container.addChild(sprite);
              app.stage.addChild(container);

              // set img center
              sprite.position.set(-texture.width / 2, -texture.height / 2);

              setRootContainer(container);
              editingContainer = container;

              /** Add hover set events */
              clears.push(
                onHover(
                  sprite,
                  (e) => {
                    setHoverContainer(e.currentTarget);
                  },
                  () => {
                    setHoverContainer(null);
                  }
                )
              );
            })();
            return () => {
              editingContainer?.destroy();
              clears.forEach((clear) => clear());
            };
          }}
          deps={[]}
        />
      </div>
    </PixiProvider>
  );
};

export default EditPage;
