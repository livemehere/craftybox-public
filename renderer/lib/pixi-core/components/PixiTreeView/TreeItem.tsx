import { Container, ContainerChild } from 'pixi.js';
import { IoMdCloseCircle } from 'react-icons/io';
import { useState } from 'react';

import { cn } from '@/utils/cn';

export interface TreeItemProps {
  onHoverContainer: (container: Container | null) => void;
  onClickContainer: (container: Container | null) => void;
  onDeleteContainer: (container: Container) => void;

  activeContainer: Container | null;

  container: Container<ContainerChild>;
  depth?: number;
  isLast: boolean;
}

export default function TreeItem({
  container,
  depth = 0,
  isLast,
  ...props
}: TreeItemProps) {
  const {
    onHoverContainer,
    onClickContainer,
    activeContainer,
    onDeleteContainer,
  } = props;
  const isSelected = activeContainer === container;
  const [isHovered, setIsHovered] = useState(false);

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
        onMouseEnter={() => {
          onHoverContainer(container);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          onHoverContainer(null);
          setIsHovered(false);
        }}
        onClick={() => onClickContainer(container)}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            e.stopPropagation();
            e.preventDefault();
            onDeleteContainer(container);
          }
        }}
      >
        <div className={'flex w-full items-center justify-between gap-8 pl-16'}>
          <div className={'flex items-center gap-8'}>
            {isLast ? (
              <svg
                width="8"
                height="17"
                fill="none"
                className={'-translate-y-8'}
              >
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
            <span>{container.label}</span>
          </div>
          {isHovered && (
            <button
              className={
                'mr-16 cursor-pointer rounded-full p-4 hover:bg-white/10'
              }
              onClick={() => onDeleteContainer(container)}
            >
              <IoMdCloseCircle color={'gray'} />
            </button>
          )}
        </div>
      </div>
      {container.children.length > 0 && (
        <div style={{ paddingLeft: depth * 10 }}>
          {container.children.map((child, i) => {
            return (
              <TreeItem
                container={child}
                depth={depth + 1}
                key={child.uid}
                isLast={i === container.children.length - 1}
                {...props}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
