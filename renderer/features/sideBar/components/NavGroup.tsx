interface Props {
  children: React.ReactNode;
  name: string;
}

const NavGroup = ({ children, name }: Props) => {
  return (
    <section className={'mb-3'}>
      <label className={'pl-2 text-xs opacity-70'}>{name}</label>
      <ul className={'mt-2 space-y-1'}>{children}</ul>
    </section>
  );
};

export default NavGroup;
