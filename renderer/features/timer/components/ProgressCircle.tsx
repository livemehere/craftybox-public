import { motion } from 'motion/react';

type Props = {
  progress: number;
  size: number;
  strokeWidth: number;
  bgColor: string;
  color: string;
};

const ProgressCircle = ({ progress, size, strokeWidth, bgColor, color }: Props) => {
  const r = size / 2 - strokeWidth;
  const dashArray = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <motion.circle
        cx={'50%'}
        cy={'50%'}
        r={r}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill={'none'}
      ></motion.circle>
      <motion.circle
        cx={'50%'}
        cy={'50%'}
        r={r}
        fill={'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        initial={{
          strokeDashoffset: dashArray * (1 - progress)
        }}
        animate={{
          strokeDashoffset: dashArray * (1 - progress)
        }}
        style={{
          rotate: -90
        }}
      ></motion.circle>
    </svg>
  );
};

export default ProgressCircle;
