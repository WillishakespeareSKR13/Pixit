import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { css } from '@emotion/react';
import { CREATEROLE } from '@Src/apollo/client/mutation/rol';
import { GETROLES } from '@Src/apollo/client/query/rol';
import DashWithTitle from '@Src/components/layouts/DashWithTitle';
import { useRouterDashboard } from '@Src/components/templates/ADMIN';
import { InputLightStyles, TableStyles } from '@Src/styles';
import {
  AtomButton,
  AtomIcon,
  AtomInput,
  AtomLoader,
  AtomTable,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';
import { useFormik } from 'formik';
import { IQueryFilter, IRole } from 'graphql';
import * as Yup from 'yup';
import ModalUpdateColor from './update';
import ModalDeleteColor from './delete';

export type RoleModalType = IRole & {
  openModal: boolean;
};

const VIEW = () => {
  const router = useRouterDashboard();
  const [itemDelete, setitemDelete] = useState<RoleModalType>({
    openModal: false
  });
  const [itemUpdate, setItemUpdate] = useState<RoleModalType>({
    openModal: false
  });

  const [createRol] = useMutation(CREATEROLE, {
    onCompleted: () => {
      router.reload();
    }
  });

  const { data: dataRole, loading } =
    useQuery<IQueryFilter<'getRoles'>>(GETROLES);
  const formik = useFormik({
    initialValues: {
      name: '',
      label: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('name is required')
    }),
    onSubmit: (values) => {
      createRol({
        variables: {
          input: {
            ...values
          }
        }
      });
    }
  });
  if (loading)
    return (
      <AtomLoader isLoading backgroundColor="#2e2e35" colorLoading="white" />
    );
  return (
    <DashWithTitle
      title={`Roles`}
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
    >
      <ModalUpdateColor state={itemUpdate} setState={setItemUpdate} />
      <ModalDeleteColor state={itemDelete} setState={setitemDelete} />
      <AtomWrapper
        customCSS={css`
          flex-direction: row;
          justify-content: flex-start;
          gap: 20px;
        `}
      >
        <AtomWrapper
          customCSS={css`
            width: 60%;
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
            All Roles
          </AtomText>
          <AtomTable
            customCSS={TableStyles}
            data={dataRole?.getRoles as IRole[]}
            columns={[
              {
                title: '',
                view: (item) => (
                  <AtomWrapper flexDirection="row">
                    <AtomButton
                      backgroundColor="transparent"
                      padding="0px 0px"
                      margin="0px 5px 0px 15px"
                      onClick={() => {
                        setItemUpdate({ ...item, openModal: true });
                      }}
                    >
                      <AtomIcon
                        width="20px"
                        height="20px"
                        icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/assets/svgs/JRO-0001/icons/Component%20200%20%E2%80%93%202.svg"
                        customCSS={css`
                          svg {
                            g {
                              path {
                                fill: none !important;
                                stroke: #579af1 !important;
                              }
                            }
                          }
                        `}
                      />
                    </AtomButton>

                    <AtomButton
                      backgroundColor="transparent"
                      padding="0px 0px"
                      margin="0px 5px 0px 15px"
                      onClick={() => {
                        setitemDelete({
                          ...item,
                          openModal: true
                        });
                      }}
                    >
                      <AtomIcon
                        height="20px"
                        width="20px"
                        color="#f1576c"
                        icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/MDC-0001/svg/trash-svgrepo-com.svg"
                      />
                    </AtomButton>
                  </AtomWrapper>
                ),
                width: '90px',
                customCSS: css`
                  padding: 10px 0px !important;
                `
              },
              {
                title: 'Name',
                view: (item) => <>{`${item?.name}`}</>
              },
              {
                title: 'Label',
                view: (item) => <>{`${item?.label ?? 'N/A'}`}</>
              }
            ]}
          />
        </AtomWrapper>
        <AtomWrapper
          customCSS={css`
            width: 40%;
          `}
        >
          <AtomWrapper
            customCSS={css`
              width: 100%;
              height: max-content;
              background-color: #202026;
              justify-content: space-between;
              border-radius: 8px;
              padding: 15px 20px;
            `}
          >
            <AtomWrapper>
              <AtomText
                customCSS={css`
                  color: #dfdfdf;
                  font-size: 16px;
                  font-weight: 600;
                `}
              >
                Add Role
              </AtomText>
            </AtomWrapper>
            <AtomWrapper
              customCSS={css`
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin-top: 10px;
                flex-wrap: wrap;
              `}
            >
              <AtomInput
                labelWidth="47%"
                customCSS={InputLightStyles}
                formik={formik}
                label="Name"
                id="name"
              />
              <AtomInput
                labelWidth="47%"
                customCSS={InputLightStyles}
                formik={formik}
                label="Label"
                id="label"
              />

              <AtomButton
                customCSS={css`
                  width: 100%;
                  padding: 8px 10px;
                  background-color: #f1576c;
                `}
                onClick={() => {
                  formik.submitForm();
                }}
              >
                Add Role
              </AtomButton>
            </AtomWrapper>
          </AtomWrapper>
        </AtomWrapper>
      </AtomWrapper>
    </DashWithTitle>
  );
};

export default VIEW;
