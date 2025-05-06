import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import PixiProvider from '@/lib/pixi-design-editor/components/PixiProvider';
import PixiCanvas from '@/lib/pixi-design-editor/components/PixiCanvas';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';
import { SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY } from '@/features/edit/schema';
import {
  EditMode,
  exportContainerAtom,
  hoverObjAtom,
  modeAtom,
  selectedObjAtom,
} from '@/lib/pixi-design-editor/stores';
import Grid from '@/lib/pixi-design-editor/components/ui/Grid';

const EditPage = () => {
  const open = useAtomValue(lnbOpenAtom);
  const setEditingContainer = useSetAtom(exportContainerAtom);
  const selectedObj = useAtomValue(selectedObjAtom);
  const hoverObj = useAtomValue(hoverObjAtom);

  const [mode, setMode] = useAtom(modeAtom);
  const prevMode = useRef<EditMode | undefined>(undefined);

  const imgUrl = useMemo(() => {
    const targetUrl = localStorage.getItem(
      SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY
    );
    // localStorage.removeItem(SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY);
    return targetUrl || null;
  }, []);

  /** toggle move mode while pressing space */
  useHotkeys('space', () => {
    if (mode === 'move') return;
    prevMode.current = mode;
    setMode('move');
  });
  useHotkeys(
    'space',
    () => {
      if (prevMode.current) {
        setMode(prevMode.current);
        prevMode.current = undefined;
      }
    },
    {
      keyup: true,
      keydown: false,
    }
  );
  useHotkeys('v', () => setMode('select'));
  useHotkeys('h', () => setMode('move'));
  /** drawing */
  useHotkeys('r', () => setMode('draw-rect'));

  // useEffect(() => {
  //   let restoreSelectedObj: () => void = () => {};
  //   let restoreHoverObj: () => void = () => {};
  //
  //   if (selectedObj) {
  //     restoreSelectedObj = makeHighLight(selectedObj);
  //   }
  //
  //   if (hoverObj) {
  //     restoreHoverObj = makeHighLight(hoverObj);
  //   }
  //
  //   return () => {
  //     if (selectedObj !== hoverObj) {
  //       restoreSelectedObj();
  //       restoreHoverObj();
  //     }
  //   };
  // }, [selectedObj, hoverObj]);

  return (
    <PixiProvider resizeDeps={[open]}>
      <div className={'relative h-full w-full'}>
        {/*<WheelController enable={true} />*/}
        {/*<PanController enable={mode === 'move'} />*/}
        <Grid />
        {/*<PixiTreeView />*/}
        <PixiCanvas />
        {/*<HandToolsController />*/}
        {/*<DetailController />*/}
        {/*<InteractionController />*/}
        {/** initialize with Image */}
        {/*<PixiExecutor*/}
        {/*  cb={(app) => {*/}
        {/*    let editingContainer: Container | null = null;*/}
        {/*    (async () => {*/}
        {/*      if (!imgUrl) return;*/}
        {/*      const container = new Container();*/}
        {/*      container.label = 'Frame';*/}
        {/*      const texture = await Assets.load(imgUrl);*/}
        {/*      const sprite = new Sprite(texture);*/}
        {/*      sprite.label = 'Image';*/}

        {/*      // add.*/}
        {/*      container.addChild(sprite);*/}
        {/*      app.stage.addChild(container);*/}

        {/*      // set img center*/}
        {/*      sprite.position.set(-texture.width / 2, -texture.height / 2);*/}

        {/*      // set viewport center*/}
        {/*      app.stage.position.set(*/}
        {/*        app.screen.width / 2,*/}
        {/*        app.screen.height / 2*/}
        {/*      );*/}

        {/*      setEditingContainer(container);*/}
        {/*      editingContainer = container;*/}
        {/*    })();*/}
        {/*    return () => {*/}
        {/*      editingContainer?.destroy();*/}
        {/*    };*/}
        {/*  }}*/}
        {/*  deps={[]}*/}
        {/*/>*/}
      </div>
    </PixiProvider>
  );
};

export default EditPage;
