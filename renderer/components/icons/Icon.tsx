import { useMemo } from "react";

import { IconKeys, IconMap } from "./IconMap";

export const Icon = ({
  name,
  ...props
}: React.ComponentProps<"svg"> & {
    title?: string;
    titleId?: string;
    desc?: string;
    descId?: string;
    name: IconKeys;
}) => {
  const Comp = useMemo(() => IconMap[name], [name]);
  return <Comp {...props} />;
};