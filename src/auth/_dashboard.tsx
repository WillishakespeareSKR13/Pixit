import { AtomLoader } from '@sweetsyui/ui';
import { QueryTypeNode } from 'next';
import { useRouter } from 'next/router';
import React, { FC } from 'react';

type Props = QueryTypeNode & {
  children?: React.ReactNode;
};

const DASHBOARD: FC<Props> = ({ children, query }) => {
  const { loading, error } = query;
  const router = useRouter();

  if (error) {
    router.push('/');
  }

  return (
    <>
      {loading || error ? (
        <AtomLoader
          isLoading={loading}
          colorLoading="white"
          backgroundColor="#202024"
        />
      ) : (
        children
      )}
    </>
  );
};

export default DASHBOARD;
