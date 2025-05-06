import { useForceUpdate } from '@fewings/react/hooks';
import { Container } from 'pixi.js';

import { usePixiEffect } from '@/lib/pixi-core/hooks/usePixiEffect';
import { usePixi } from '@/lib/pixi-core/PixiContext';
import TreeItem, {
  TreeItemProps,
} from '@/lib/pixi-core/components/PixiTreeView/TreeItem';

const PixiTreeView = (
  props: Pick<
    TreeItemProps,
    'activeContainer' | 'onClickContainer' | 'onHoverContainer'
  >
) => {
  const { app } = usePixi();
  const update = useForceUpdate();

  const watchChildrenRecursive = (
    container: Container,
    handler: () => void
  ) => {
    const registered = new WeakSet<Container>();

    const register = (target: Container) => {
      if (!registered.has(target)) {
        registered.add(target);
        target.on('childAdded', childHandler);
        target.on('childRemoved', childHandler);
        console.log(`[Tree] watch ${target.label}`);
      }

      for (const child of target.children) {
        register(child);
      }
    };

    const unregister = (target: Container) => {
      if (registered.has(target)) {
        registered.delete(target);
        target.off('childAdded', childHandler);
        target.off('childRemoved', childHandler);
      }

      for (const child of target.children) {
        unregister(child);
      }
    };

    const childHandler = (child: Container) => {
      handler();
      register(child);
    };

    register(container);

    return () => {
      unregister(container);
    };
  };

  /** watch `stage`, `editingContainer` children change and update tree ui */
  usePixiEffect((app) => {
    const clear = watchChildrenRecursive(app.stage, update);
    update();
    return () => {
      clear();
    };
  }, []);

  return (
    <div
      className={
        'bg-app-gray absolute top-14 bottom-14 left-14 w-280 rounded-lg py-12 shadow shadow-white/10'
      }
    >
      <section className={'px-16 py-8'}>Stage</section>
      {app?.stage.children.map((child, i) => (
        <TreeItem
          container={child}
          key={child.uid}
          isLast={i === app.stage.children.length - 1}
          {...props}
        />
      ))}
    </div>
  );
};

export default PixiTreeView;
