import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Kbd = ({ children }: Props) => {
  return (
    <kbd
      className={
        'text-white-400 rounded-sm bg-neutral-700/50 px-6 py-2 text-xs'
      }
    >
      {children}
    </kbd>
  );
};

export default Kbd;
