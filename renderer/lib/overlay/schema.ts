import { Dispatch, ReactNode, SetStateAction } from 'react';

export interface OverlayBaseProps<Resolve> {
  resolve: (v: Resolve) => void;
  reject: (reason: any) => void;
}

export interface OverlayOptions {
  closeOnClickOutside?: boolean;
}

export interface OverlayItem<Resolve> {
  id: number;
  render: (props: OverlayBaseProps<Resolve>) => ReactNode;
  resolve: (v: Resolve) => void;
  reject: (reason: any) => void;
  options?: OverlayOptions;
}

export interface OverlayContextProps {
  items: OverlayItem<any>[];
  setItems: Dispatch<SetStateAction<OverlayItem<any>[]>>;
  idRef: { current: number };
}
