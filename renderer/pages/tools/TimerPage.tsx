import TimerList from '@/features/timer/components/TimerList';
import ActiveTimer from '@/features/timer/components/ActiveTimer';

const TimerPage = () => {
  return (
    <div className={'page-wrapper flex px-4 pb-4'}>
      <section className={'flex flex-1 items-center justify-center'}>
        <ActiveTimer />
      </section>
      <section
        className={
          'relative ml-4 w-[300px] overflow-y-auto rounded-md bg-neutral-800/50 p-3 pr-1'
        }
      >
        <TimerList />
      </section>
    </div>
  );
};

export default TimerPage;
