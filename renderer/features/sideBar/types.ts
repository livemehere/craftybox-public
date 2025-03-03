import type { IconType } from 'react-icons';

export type TNavItem = {
  itemName: string;
  Icon?: IconType;
  subItems?: TNavItem[];
  path?: string;
};

export type TNavItemGroup = {
  groupName: string;
  items: TNavItem[];
};
