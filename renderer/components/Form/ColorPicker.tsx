import { HTMLAttributes, RefObject, useImperativeHandle, useRef } from 'react';

import { cn } from '@/utils/cn';

export type TColorPickerRef = {
  focus: () => void;
  blur: () => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
  ref: RefObject<TColorPickerRef>;
};

const ColorPicker = ({
  value,
  onChange,
  children,
  ref,
  ...props
}: Props & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.click(),
    blur: () => inputRef.current?.blur()
  }));
  return (
    <div
      className={cn('relative', {
        'h-[20px] w-[20px] rounded': !children
      })}
      style={{
        ...(!children && { backgroundColor: value })
      }}
      onClick={() => {
        inputRef.current?.click();
      }}
      {...props}
    >
      {children}
      <input
        ref={inputRef}
        type='color'
        className={'pointer-events-none invisible absolute inset-0'}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
};

export default ColorPicker;
