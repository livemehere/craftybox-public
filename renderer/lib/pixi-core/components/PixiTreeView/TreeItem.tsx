import { Container, ContainerChild } from 'pixi.js';

import { cn } from '@/utils/cn';

export interface TreeItemProps {
  onHoverContainer: (container: Container | null) => void;
  onClickContainer: (container: Container | null) => void;
  activeContainer: Container | null;

  container: Container<ContainerChild>;
  depth?: number;
  isLast: boolean;
}

export default function TreeItem({
  container,
  depth = 0,
  isLast,
  onHoverContainer,
  onClickContainer,
  activeContainer,
}: TreeItemProps) {
  const isSelected = activeContainer === container;
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
        tabIndex={0}
        onMouseEnter={() => onHoverContainer(container)}
        onMouseLeave={() => onHoverContainer(null)}
        onClick={() => onClickContainer(container)}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            e.stopPropagation();
            e.preventDefault();
            container.destroy();
            onClickContainer(null);
          }
        }}
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
              onHoverContainer={onHoverContainer}
              onClickContainer={onClickContainer}
              activeContainer={activeContainer}
            />
          );
        })}
      </div>
    </div>
  );
}
