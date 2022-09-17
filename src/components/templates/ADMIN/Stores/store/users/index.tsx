import { useMutation, useQuery } from '@apollo/client';
import { css } from '@emotion/react';
import { GETROLES } from '@Src/apollo/client/query/rol';
import { GETSTOREBYID } from '@Src/apollo/client/query/stores';
import { CREATEUSER, GETUSERS } from '@Src/apollo/client/query/user';
import DashWithTitle from '@Src/components/layouts/DashWithTitle';
import { InputLightStyles, InputSelectStyles, TableStyles } from '@Src/styles';
import {
  AtomButton,
  AtomInput,
  AtomLoader,
  AtomTable,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';
import { useFormik } from 'formik';
import { IQueryFilter, IUser } from 'graphql';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { useRouterDashboard } from '../../..';

const VIEW = () => {
  const params = useParams();
  const router = useRouterDashboard();
  const { data, loading } = useQuery<IQueryFilter<'getStoreById'>>(
    GETSTOREBYID,
    {
      variables: {
        id: params.id
      }
    }
  );
  const [createUser] = useMutation(CREATEUSER, {
    onCompleted: () => {
      router.reload();
    }
  });
  const { data: dataUsers } = useQuery<IQueryFilter<'getUsers'>>(GETUSERS, {
    variables: {
      skip: !data?.getStoreById?.id,
      filter: {
        store: data?.getStoreById?.id
      }
    }
  });
  const { data: dataRole } = useQuery<IQueryFilter<'getRoles'>>(GETROLES);
  const formik = useFormik({
    initialValues: {
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: 'DEFAULT',
      store: [router?.query?.id?.[router.query.id.length - 2] ?? '']
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('name is required'),
      lastname: Yup.string().required('lastname is required'),
      email: Yup.string()
        .email('email is invalid')
        .required('email is required'),
      password: Yup.string().required('password is required'),
      role: Yup.string()
        .required('role is required')
        .test('role', 'role is required', (value) => value !== 'DEFAULT')
    }),
    onSubmit: (values) => {
      createUser({
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
    >
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
            Users of store {data?.getStoreById?.name}
          </AtomText>
          <AtomTable
            customCSS={TableStyles}
            data={dataUsers?.getUsers as IUser[]}
            columns={[
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
        </AtomWrapper>
        <AtomWrapper
          customCSS={css`
            width: 40%;
          `}
        >
          <AtomWrapper
            key={data?.getStoreById?.id}
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
                Add user
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
                label="name"
                id="name"
              />
              <AtomInput
                labelWidth="47%"
                customCSS={InputLightStyles}
                formik={formik}
                label="Lastname"
                id="lastname"
              />
              <AtomInput
                labelWidth="47%"
                customCSS={InputLightStyles}
                formik={formik}
                label="Email"
                id="email"
              />
              <AtomInput
                labelWidth="47%"
                customCSS={InputLightStyles}
                formik={formik}
                label="Password"
                id="password"
              />

              <AtomInput
                labelWidth="47%"
                type="select"
                label="Role"
                id="role"
                optionColor="#dfdfdf"
                fontWeight="500"
                formik={formik}
                customCSS={InputSelectStyles}
                defaultText="Select role"
                options={dataRole?.getRoles?.map((item) => ({
                  value: `${item?.id}`,
                  label: `${item?.label ?? item?.name}`,
                  id: `${item?.id}`
                }))}
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
                Add User
              </AtomButton>
            </AtomWrapper>
          </AtomWrapper>
        </AtomWrapper>
      </AtomWrapper>
    </DashWithTitle>
  );
};

export default VIEW;
