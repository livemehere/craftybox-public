import WithBreadcrumb from '@/components/WithBreadcrumb';
import TimerList from '@/features/timer/components/TimerList';
import ActiveTimer from '@/features/timer/components/ActiveTimer';

const TimerPage = () => {
  return (
    <WithBreadcrumb
      items={[
        { name: '도구', path: '/tools' },
        { name: '타이머', path: '/tools/timer' },
      ]}
    >
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
    </WithBreadcrumb>
  );
};

export default TimerPage;
