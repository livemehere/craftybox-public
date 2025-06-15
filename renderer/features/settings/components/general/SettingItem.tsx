import { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  children: ReactNode;
};

const SettingItem = ({ title, children }: Props) => {
  return (
    <div
      className={'typo-body1 flex w-full justify-between rounded-lg px-3 py-2'}
    >
      <span>{title}</span>
      <span className={'opacity-80'}>{children}</span>
    </div>
  );
};

export default SettingItem;
