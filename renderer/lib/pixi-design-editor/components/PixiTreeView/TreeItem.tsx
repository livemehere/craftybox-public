import { Container, ContainerChild } from 'pixi.js';
import { useAtom, useSetAtom } from 'jotai';

import { cn } from '@/utils/cn';
import { hoverObjAtom, selectedObjAtom } from '@/lib/pixi-design-editor/stores';

export default function TreeItem({
  container,
  depth = 0,
  isLast,
}: {
  container: Container<ContainerChild>;
  depth?: number;
  isLast: boolean;
}) {
  const setHoverObj = useSetAtom(hoverObjAtom);
  const [selectedObj, setSelectedObj] = useAtom(selectedObjAtom);
  const isSelected = selectedObj === container;

  return (
    <div className={'hover:bg-app-soft-gray'}>
      <div
        style={{ paddingLeft: depth * 10 }}
        className={cn(
          'typo-body2 hover:border-app-primary flex h-32 items-center border-1 border-transparent',
          {
            'bg-app-primary/80': isSelected,
          }
        )}
        onMouseEnter={() => setHoverObj(container)}
        onMouseLeave={() => setHoverObj(null)}
        onClick={() => setSelectedObj(container)}
      >
        <div className={'flex items-center gap-8 pl-16'}>
          {isLast ? (
            <svg width="8" height="17" fill="none" className={'-translate-y-8'}>
              <path
                d="M0.5 0V15.5C0.5 16.0523 0.947715 16.5 1.5 16.5H8"
                stroke={isSelected ? 'white' : 'gray'}
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="8" height="32" fill="none">
              <path
                d="M0.5 0V16.5M0.5 32V16.5M0.5 16.5H8"
                stroke={isSelected ? 'white' : 'gray'}
              />
            </svg>
          )}
          {container.label}
        </div>
      </div>
      <div style={{ paddingLeft: depth * 10 }}>
        {container.children.map((child, i) => {
          return (
            <TreeItem
              container={child}
              depth={depth + 1}
              key={child.uid}
              isLast={i === container.children.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}
