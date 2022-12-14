import { FC } from 'react';
import { css } from '@emotion/react';
import { AtomButton, AtomWrapper } from '@sweetsyui/ui';
import AuthContext from '@Src/hooks/authContext';
import { useDispatch } from 'react-redux';
import { Logout } from '@Src/redux/actions/user';

type Props = {
  Role?: string | string[];
  children: React.ReactNode;
};

const DefaultLayout: FC<Props> = ({ children }) => {
  const dispatch = useDispatch();
  return (
    <AuthContext type="DASHBOARD">
      <AtomWrapper
        minHeight="100vh"
        height="max-content"
        backgroundColor="transparent"
        customCSS={css`
          background-color: #2e2e35;
          z-index: -1;
          min-height: calc(100vh - 60px);
          margin-top: 60px;
          justify-content: flex-start;
          width: 100%;
        `}
      >
        <AtomWrapper
          maxWidth="1440px"
          minHeight="calc(100vh - 60px)"
          height="max-content"
          alignItems="center"
          justifyContent="flex-start"
          customCSS={css`
            padding: 40px 90px;
            @media only screen and (max-width: 980px) {
              padding: 20px 30px;
            }
          `}
        >
          {children}
        </AtomWrapper>
      </AtomWrapper>
      <AtomWrapper
        customCSS={css`
          z-index: 10;
          padding: 0px 90px;
          align-items: flex-end;
          top: 0px;
          background-color: #1a1a1f;
          height: 60px;
          position: fixed;
          width: 100%;
        `}
      >
        <AtomButton
          padding="8px 20px"
          fontSize="10px"
          backgroundColor="#f1576c"
          borderRadius="2px"
          onClick={() => {
            dispatch(Logout());
            location.reload();
          }}
        >
          Sign Out
        </AtomButton>
      </AtomWrapper>
    </AuthContext>
  );
};
export default DefaultLayout;
