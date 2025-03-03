import { motion, useAnimate } from 'motion/react';
import { useEffect } from 'react';

type Props = {
  char: string;
};
export const ShortCutInputOverlay = ({ char }: Props) => {
  const [scope, animate] = useAnimate();
  useEffect(() => {
    animate(scope.current, {
      scale: [0.9, 1]
    });
  }, [char]);

  return (
    <div className={'fixed inset-0 flex flex-col items-center justify-center bg-black/50'}>
      <motion.div
        animate={{
          scale: [0.9, 1]
        }}
        className={'flex flex-col items-center justify-center gap-6 text-xl'}
      >
        <div>사용할 단축키를 그대로 입력하세요</div>
        <div
          ref={scope}
          className={
            'flex h-[200px] w-[200px] items-center justify-center gap-2 rounded-md bg-neutral-800 p-4 text-3xl opacity-80'
          }
        >
          <p>{char}</p>
        </div>
      </motion.div>
    </div>
  );
};
