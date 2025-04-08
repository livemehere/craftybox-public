const CurrentUser = () => {
  return (
    <div
      className={'flex items-center gap-2 rounded-md p-2 hover:bg-neutral-700'}
    >
      <Avatar />
      <UserInfo />
    </div>
  );
};

export default CurrentUser;

const Avatar = () => {
  return (
    <div
      className={
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600'
      }
    >
      U
    </div>
  );
};

const UserInfo = () => {
  return (
    <div className={'text-white'}>
      <div className={'text-xs font-bold'}>User</div>
      <div className={'text-xs opacity-50'}>user@gmail.com</div>
    </div>
  );
};
