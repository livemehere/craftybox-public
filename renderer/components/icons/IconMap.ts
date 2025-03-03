import { ComponentProps, FunctionComponent } from 'react';
import LoadingIcon from '@/assets/svg/loading.svg?react';

export type IconKeys = 'loading'

export const IconMap: Record<IconKeys, FunctionComponent<ComponentProps<'svg'> & { title?: string; titleId?: string; desc?: string; descId?: string }>> = {
'loading': LoadingIcon
};
