import { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  children: ReactNode;
};

const SettingItem = ({ title, children }: Props) => {
  return (
    <div
      className={
        'bg-black-300 flex w-full justify-between rounded-lg bg-neutral-900 p-4 text-sm'
      }
    >
      <span>{title}</span>
      <span className={'opacity-80'}>{children}</span>
    </div>
  );
};

export default SettingItem;
