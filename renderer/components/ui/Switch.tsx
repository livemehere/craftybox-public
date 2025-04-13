import { motion } from 'motion/react';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

const Switch = ({ value, onChange }: Props) => {
  return (
    <motion.div
      className={
        'flex h-[20px] w-[36px] cursor-pointer items-center rounded-full px-[3px] py-1'
      }
      style={{
        justifyContent: value ? 'flex-end' : 'flex-start',
      }}
      animate={{ backgroundColor: value ? '#095FDB' : '#3A3A3A' }}
      onClick={() => onChange(!value)}
    >
      <motion.div
        className={'h-[14px] w-[14px] rounded-full bg-white'}
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      />
    </motion.div>
  );
};

export default Switch;
