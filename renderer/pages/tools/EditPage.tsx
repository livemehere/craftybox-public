import {
  Assets,
  Container,
  ContainerChild,
  Filter,
  Graphics,
  Point,
  Sprite,
} from 'pixi.js';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useRef, useState } from 'react';
import { LuMousePointer2 } from 'react-icons/lu';
import { PiHandGrabbing } from 'react-icons/pi';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';
import { BiRectangle } from 'react-icons/bi';
import { useHotkeys } from 'react-hotkeys-hook';
import { useForceUpdate } from '@fewings/react/hooks';
import { OutlineFilter } from 'pixi-filters';

import PixiProvider from '@/lib/pixi/components/PixiProvider';
import PixiCanvas from '@/lib/pixi/components/PixiCanvas';
import { usePixiEffect } from '@/lib/pixi/hooks/usePixiEffect';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';
import { SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY } from '@/features/edit/schema';
import { cn } from '@/utils/cn';
import ZoomController from '@/lib/pixi/components/Controller/ZoomController';
import PanController from '@/lib/pixi/components/Controller/PanController';
import { usePixi } from '@/lib/pixi/PixiContext';
import { useToast } from '@/lib/toast/ToastContext';
import Grid from '@/lib/pixi/components/ui/Grid';

const hoverObjAtom = atom<Container | null>(null);
hoverObjAtom.debugLabel = 'hover obj';
const selectedObjAtom = atom<Container | null>(null);
selectedObjAtom.debugLabel = 'selected obj';
const editingContainerAtom = atom<Container | null>(null);
editingContainerAtom.debugLabel = 'editing container';

const EditPage = () => {
  const open = useAtomValue(lnbOpenAtom);
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
        <QuickImgEditor imgUrl={imgUrl} />
        <ZoomController />
        <Grid />
        <ObjectTree />
        <PixiCanvas />
        <EditSideBar />
      </div>
    </PixiProvider>
  );
};

export default EditPage;

type EditMode = 'select' | 'move' | 'rect';
function QuickImgEditor({ imgUrl }: { imgUrl: string | null }) {
  const [editingContainer, setEditingContainer] = useAtom(editingContainerAtom);
  const imgSpriteRef = useRef<Sprite | null>(null);
  const [mode, setMode] = useState<EditMode>('select');
  const prevMode = useRef(mode);

  // movable while space bar is pressed
  useHotkeys('space', () => {
    if (mode === 'move') return;
    prevMode.current = mode;
    setMode('move');
    console.log('prevmode is ', prevMode.current);
  });
  useHotkeys(
    'space',
    () => {
      setMode(prevMode.current);
      console.log('restore mode to ', prevMode.current);
    },
    {
      keyup: true,
      keydown: false,
    }
  );
  useHotkeys('h', () => setMode('move'));
  useHotkeys('v', () => setMode('select'));
  useHotkeys('r', () => setMode('rect'));

  // drawing control
  usePixiEffect(
    (app) => {
      if (mode === 'move' || mode === 'select') return;
      if (!editingContainer) return;

      let isDrawing = false;
      let graphics: Graphics;

      console.log('start mode', mode);
      const handleDown = (e: PointerEvent) => {
        isDrawing = true;
        graphics = new Graphics();

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        graphics.position.set(localPos.x, localPos.y);
        editingContainer.addChild(graphics);
        console.log('added', graphics.x, graphics.y);
      };

      const handleMove = (e: PointerEvent) => {
        if (!isDrawing) return;

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        const dx = localPos.x - graphics.x;
        const dy = localPos.y - graphics.y;

        switch (mode) {
          case 'rect':
            graphics.clear();
            graphics.rect(0, 0, dx, dy).stroke({
              width: 4,
              color: 'red',
            });

            break;
          default:
            throw new Error('invalid drawing mode: ' + mode);
        }
      };

      const handleUp = () => {
        isDrawing = false;
      };

      app.canvas.addEventListener('pointerdown', handleDown);
      app.canvas.addEventListener('pointermove', handleMove);
      app.canvas.addEventListener('pointerup', handleUp);

      return () => {
        app.canvas.removeEventListener('pointerdown', handleDown);
        app.canvas.removeEventListener('pointermove', handleMove);
        app.canvas.removeEventListener('pointerup', handleUp);
      };
    },
    [mode, editingContainer]
  );

  usePixiEffect((app) => {
    (async () => {
      if (!imgUrl) return;
      const container = new Container();
      container.label = 'Export';
      const texture = await Assets.load(imgUrl);
      const sprite = new Sprite(texture);
      imgSpriteRef.current = sprite;

      // add.
      container.addChild(sprite);
      app.stage.addChild(container);

      // set img center
      sprite.position.set(-texture.width / 2, -texture.height / 2);

      // set viewport center
      app.stage.position.set(app.screen.width / 2, app.screen.height / 2);

      setEditingContainer(container);
    })();
    return () => {
      editingContainer?.destroy();
    };
  });

  const btnClassName =
    'hover:bg-app-soft-gray p-8 [&[data-active=true]]:bg-app-primary cursor-pointer rounded';

  const buttons: { icon: React.ReactNode; mode: EditMode }[] = [
    {
      icon: <LuMousePointer2 className={'h-20 w-20'} />,
      mode: 'select',
    },
    {
      icon: <PiHandGrabbing className={'h-20 w-20 -translate-y-1'} />,
      mode: 'move',
    },
    {
      icon: <BiRectangle className={'h-20 w-20'} />,
      mode: 'rect',
    },
  ];

  return (
    <div
      className={cn(
        'absolute bottom-80 left-1/2 z-10 -translate-x-1/2',
        'bg-app-gray rounded p-8',
        'flex items-center gap-8'
      )}
    >
      <PanController enable={mode === 'move'} />
      {buttons.map(({ icon, mode: _mode }, index) => (
        <button
          key={index}
          className={cn(btnClassName)}
          data-active={_mode === mode}
          onClick={() => setMode(_mode)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function EditSideBar() {
  const { app } = usePixi();
  const { pushMessage } = useToast();
  const editingContainer = useAtomValue(editingContainerAtom);

  const getDataUrl = async () => {
    if (!app) throw new Error('app is not ready');
    if (!editingContainer) throw new Error('container is not found');
    return app.renderer.extract.base64(editingContainer);
  };

  const handleCopy = async () => {
    const dataUrl = await getDataUrl();
    const blob = await fetch(dataUrl).then((res) => res.blob());
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    pushMessage('Copied to clipboard', {
      type: 'success',
    });
  };

  const handleDownload = async () => {
    const dataUrl = await getDataUrl();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'screenshot.png';
    link.click();
    link.remove();
  };

  const btnClassName =
    'bg-app-soft-gray rounded px-12 py-6 hover:bg-[#414244] cursor-pointer';

  return (
    <aside
      className={
        'bg-app-gray absolute top-20 right-20 flex w-230 flex-col rounded-lg'
      }
    >
      <section className={'flex items-center justify-end gap-8 p-12'}>
        <div className={'mx-4 h-20 w-2 bg-white/20'}></div>

        <button className={btnClassName} onClick={handleCopy}>
          <TbCopy className={'text-white/80'} />
        </button>
        <button className={btnClassName} onClick={handleDownload}>
          <FiDownload className={'text-white/80'} />
        </button>
      </section>

      {/*<hr className={'border-[0.5px] border-white/10'} />*/}
    </aside>
  );
}

function ObjectTree() {
  const { app } = usePixi();
  const update = useForceUpdate();
  const editingContainer = useAtomValue(editingContainerAtom);

  usePixiEffect(
    (app) => {
      if (!editingContainer) return;
      const handler = () => {
        update();
      };
      app.stage.on('childAdded', handler);
      app.stage.on('childRemoved', handler);
      editingContainer.on('childAdded', handler);
      editingContainer.on('childRemoved', handler);
      return () => {
        editingContainer.off('childAdded', handler);
        editingContainer.off('childRemoved', handler);
        app.stage.off('childAdded', handler);
        app.stage.off('childRemoved', handler);
      };
    },
    [editingContainer]
  );

  /** highlight `Container` in view that hover in tree. */
  const hoverObj = useAtomValue(hoverObjAtom);
  usePixiEffect(() => {
    if (!hoverObj) return;
    const target = hoverObj;
    let prevFilters: Filter[] = [];
    prevFilters = (
      Array.isArray(target.filters) ? [...target.filters] : [target.filters]
    ).filter(Boolean);
    target.filters = [
      ...prevFilters,
      new OutlineFilter({
        thickness: 1,
        color: 0xff0000,
      }),
    ];
    return () => {
      target.filters = prevFilters;
    };
  }, [hoverObj]);

  return (
    <div
      className={
        'bg-app-gray absolute top-14 bottom-14 left-14 w-280 rounded-lg py-12 shadow shadow-white/10'
      }
    >
      <section className={'px-16 py-8'}>Layer</section>
      {app?.stage.children.map((child) => (
        <TreeItem container={child} key={child.uid} />
      ))}
    </div>
  );
}

function TreeItem({
  container,
  depth = 0,
}: {
  container: Container<ContainerChild>;
  depth?: number;
}) {
  const setHoverObj = useSetAtom(hoverObjAtom);
  const [selectedObj, setSelectedObj] = useAtom(selectedObjAtom);

  return (
    <div className={'hover:bg-app-soft-gray'}>
      <div
        style={{ paddingLeft: depth * 10 }}
        className={cn(
          'typo-body2 hover:border-app-primary flex h-32 items-center border-y-1 border-transparent',
          {
            'bg-app-primary/80': container === selectedObj,
          }
        )}
        onMouseEnter={() => setHoverObj(container)}
        onMouseLeave={() => setHoverObj(null)}
        onClick={() => setSelectedObj(container)}
      >
        <div className={'pl-16'}>{container.label}</div>
      </div>
      <div style={{ paddingLeft: depth * 10 }}>
        {container.children.map((child) => {
          return (
            <TreeItem container={child} depth={depth + 1} key={child.uid} />
          );
        })}
      </div>
    </div>
  );
}
