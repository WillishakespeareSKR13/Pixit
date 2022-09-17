import { Provider } from 'jotai';
import { FC } from 'react';

type Props = {
  children: React.ReactNode;
};
const JotaiProvider: FC<Props> = ({ children }) => (
  <Provider>{children}</Provider>
);

export default JotaiProvider;
