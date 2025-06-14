import { ComponentProps, FunctionComponent } from 'react';

import ConstraintIcon from '@/assets/svg/constraint.svg?react';
import EditIcon from '@/assets/svg/edit.svg?react';
import ExpandIcon from '@/assets/svg/expand.svg?react';
import HambergerIcon from '@/assets/svg/hamberger.svg?react';
import ImgIcon from '@/assets/svg/img.svg?react';
import LoadingIcon from '@/assets/svg/loading.svg?react';
import RecordIcon from '@/assets/svg/record.svg?react';
import SettingsIcon from '@/assets/svg/settings.svg?react';

export type IconKeys =
  | 'constraint'
  | 'edit'
  | 'expand'
  | 'hamberger'
  | 'img'
  | 'loading'
  | 'record'
  | 'settings';

export const IconMap: Record<
  IconKeys,
  FunctionComponent<
    ComponentProps<'svg'> & {
      title?: string;
      titleId?: string;
      desc?: string;
      descId?: string;
    }
  >
> = {
  constraint: ConstraintIcon,
  edit: EditIcon,
  expand: ExpandIcon,
  hamberger: HambergerIcon,
  img: ImgIcon,
  loading: LoadingIcon,
  record: RecordIcon,
  settings: SettingsIcon,
};
