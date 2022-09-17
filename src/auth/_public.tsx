import { QueryTypeNode } from 'next';
import { FC } from 'react';

type Props = QueryTypeNode & {
  children?: React.ReactNode;
};

const DASHBOARD: FC<Props> = ({ children }) => {
  return <>{children}</>;
};

export default DASHBOARD;
