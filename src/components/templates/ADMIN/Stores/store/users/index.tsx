import { useQuery } from '@apollo/client';
import { css } from '@emotion/react';
import { GETSTOREBYID } from '@Src/apollo/client/query/stores';
import { GETUSERS } from '@Src/apollo/client/query/user';
import AtomTabs from '@Src/components/@atoms/AtomTabs';
import ActivateUser from '@Src/components/@molecules/ActivateUser';
import CreateUserModal from '@Src/components/@molecules/CreateUserModal';
import DesactivateUser from '@Src/components/@molecules/DesactivateUser';
import UpdateUserModal from '@Src/components/@molecules/UpdateUserModal';
import DashWithTitle from '@Src/components/layouts/DashWithTitle';
import {
  CreateUserModalAtom,
  UpdateUserModalAtom
} from '@Src/jotai/createUserModal';
import { TableStyles } from '@Src/styles';
import {
  AtomButton,
  AtomLoader,
  AtomTable,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';
import { IQueryFilter, IUser } from 'graphql';
import { useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { useRouterDashboard } from '../../..';

const VIEW = () => {
  const params = useParams();
  const router = useRouterDashboard();
  const setCreateUserModal = useSetAtom(CreateUserModalAtom);
  const setUpdUserModal = useSetAtom(UpdateUserModalAtom);
  const { data, loading } = useQuery<IQueryFilter<'getStoreById'>>(
    GETSTOREBYID,
    {
      variables: {
        id: params.id
      }
    }
  );

  const { data: dataUsers, refetch } = useQuery<IQueryFilter<'getUsers'>>(
    GETUSERS,
    {
      variables: {
        skip: !data?.getStoreById?.id,
        filter: {
          store: data?.getStoreById?.id
        }
      }
    }
  );

  if (loading)
    return (
      <AtomLoader isLoading backgroundColor="#2e2e35" colorLoading="white" />
    );
  return (
    <DashWithTitle
      title={`Users: ${data?.getStoreById?.name}`}
      url={{
        pathname: router.pathname,
        query: {
          ...router.query,
          id: [
            ...(Array.isArray(router.query.id) ? router.query.id : []).filter(
              (_, idx) => idx !== (router?.query?.id?.length ?? 0) - 1
            )
          ]
        }
      }}
      button={
        <>
          <AtomButton
            customCSS={css`
              padding: 8px 20px;
              background-color: #f1576c;
            `}
            onClick={() => setCreateUserModal(true)}
          >
            Add User
          </AtomButton>
        </>
      }
    >
      <CreateUserModal
        callback={() => {
          refetch();
        }}
      />
      <UpdateUserModal
        callback={() => {
          refetch();
        }}
      />
      <AtomWrapper
        customCSS={css`
          flex-direction: row;
          justify-content: flex-start;
          gap: 20px;
        `}
      >
        <AtomWrapper
          customCSS={css`
            width: 100%;
          `}
        >
          <AtomText
            customCSS={css`
              font-size: 20px;
              font-weight: bold;
              color: #dfdfdf;
              margin-bottom: 10px;
            `}
          >
            Users of store {data?.getStoreById?.name}
          </AtomText>
          <AtomTabs
            componentsProps={{
              tabsProps: {
                buttonActiveProps: {
                  customCSS: css`
                    background-color: #f1576c;
                  `
                },
                buttonDisabledProps: {
                  customCSS: css`
                    background-color: #202026;
                  `
                }
              },
              contentProps: {
                wrapperProps: {
                  customCSS: css`
                    border: 1px solid #2e2e35;
                  `
                }
              },
              containerProps: {
                customCSS: css`
                  border: 1px solid #2e2e35;
                `
              }
            }}
            tabs={[
              {
                title: 'Active',
                content: (
                  <AtomTable
                    customCSS={TableStyles}
                    data={
                      dataUsers?.getUsers?.filter(
                        (e) => !e?.disabled
                      ) as IUser[]
                    }
                    columns={[
                      {
                        width: '0px',
                        title: 'Actions',
                        view: (item) => (
                          <AtomWrapper
                            customCSS={css`
                              width: max-content;
                              flex-direction: row;
                              gap: 20px;
                            `}
                          >
                            <AtomButton
                              customCSS={css`
                                width: 100%;
                                padding: 8px 20px;
                                background-color: #f1576c;
                              `}
                              onClick={() => {
                                setUpdUserModal(item?.id ?? '');
                              }}
                            >
                              Edit
                            </AtomButton>
                            <DesactivateUser
                              id={item?.id ?? ''}
                              callback={() => {
                                refetch();
                              }}
                            />
                          </AtomWrapper>
                        )
                      },
                      {
                        title: 'Name',
                        view: (item) => <>{`${item?.name}`}</>
                      },
                      {
                        title: 'Lastname',
                        view: (item) => <>{`${item?.lastname}`}</>
                      },
                      {
                        title: 'Email',
                        view: (item) => <>{`${item?.email}`}</>
                      },
                      {
                        title: 'Role',
                        view: (item) => <>{`${item?.role?.name}`}</>
                      }
                    ]}
                  />
                )
              },
              {
                title: 'Disabled',
                content: (
                  <AtomTable
                    customCSS={TableStyles}
                    data={
                      dataUsers?.getUsers?.filter((e) => e?.disabled) as IUser[]
                    }
                    columns={[
                      {
                        width: '0px',
                        title: 'Actions',
                        view: (item) => (
                          <AtomWrapper
                            customCSS={css`
                              width: max-content;
                              flex-direction: row;
                              gap: 20px;
                            `}
                          >
                            <AtomButton
                              customCSS={css`
                                width: 100%;
                                padding: 8px 20px;
                                background-color: #f1576c;
                              `}
                              onClick={() => {
                                setUpdUserModal(item?.id ?? '');
                              }}
                            >
                              Edit
                            </AtomButton>
                            <ActivateUser
                              id={item?.id ?? ''}
                              callback={() => {
                                refetch();
                              }}
                            />
                          </AtomWrapper>
                        )
                      },
                      {
                        title: 'Name',
                        view: (item) => <>{`${item?.name}`}</>
                      },
                      {
                        title: 'Lastname',
                        view: (item) => <>{`${item?.lastname}`}</>
                      },
                      {
                        title: 'Email',
                        view: (item) => <>{`${item?.email}`}</>
                      },
                      {
                        title: 'Role',
                        view: (item) => <>{`${item?.role?.name}`}</>
                      }
                    ]}
                  />
                )
              }
            ]}
          />
        </AtomWrapper>
      </AtomWrapper>
    </DashWithTitle>
  );
};

export default VIEW;
