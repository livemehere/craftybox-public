import { Icon } from '@/components/icons/Icon';

const LoadingScene = () => {
  return (
    <div className={'flex h-full items-center justify-center'}>
      <Icon name={'loading'} fill={'white'} width={50} height={50} />
    </div>
  );
};

export default LoadingScene;
