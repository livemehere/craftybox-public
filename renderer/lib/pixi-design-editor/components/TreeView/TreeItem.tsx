import { Container, ContainerChild } from 'pixi.js';
import { useAtom, useSetAtom } from 'jotai';

import { cn } from '@/utils/cn';
import { hoverObjAtom, selectedObjAtom } from '@/lib/pixi-design-editor/stores';

export default function TreeItem({
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
