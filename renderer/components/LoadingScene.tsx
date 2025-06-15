import { Spinner } from '@heroui/spinner';

const LoadingScene = () => {
  return (
    <div className={'flex h-screen items-center justify-center'}>
      <Spinner size={'lg'} />
    </div>
  );
};

export default LoadingScene;
