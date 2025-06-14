import AppButtons from '@/features/LNB/components/AppButtons';

const NavBar = () => {
  return (
    <nav className={'drag-zone flex h-10 shrink-0 justify-end'}>
      <AppButtons />
    </nav>
  );
};

export default NavBar;
