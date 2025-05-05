import { useForceUpdate } from '@fewings/react/hooks';
import { useAtomValue } from 'jotai';
import { Filter } from 'pixi.js';
import { OutlineFilter } from 'pixi-filters';

import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';
import { usePixi } from '@/lib/pixi-design-editor/PixiContext';
import {
  exportContainerAtom,
  hoverObjAtom,
} from '@/lib/pixi-design-editor/stores';
import TreeItem from '@/lib/pixi-design-editor/components/PixiTreeView/TreeItem';

const PixiTreeView = () => {
  const { app } = usePixi();
  const update = useForceUpdate();
  const editingContainer = useAtomValue(exportContainerAtom);

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
      {app?.stage.children.map((child, i) => (
        <TreeItem
          container={child}
          key={child.uid}
          isLast={i === app.stage.children.length - 1}
        />
      ))}
    </div>
  );
};

export default PixiTreeView;
