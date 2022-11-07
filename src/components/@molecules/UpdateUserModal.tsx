import { AtomButton, AtomInput, AtomText, AtomWrapper } from '@sweetsyui/ui';
import { FC } from 'react';

import { css } from '@emotion/react';
import { useMutation, useQuery } from '@apollo/client';
import { IQueryFilter, IStore } from 'graphql';
import { useAtom } from 'jotai';
import { UpdateUserModalAtom } from '@Src/jotai/createUserModal';
import { InputLightStyles, InputSelectStyles } from '@Src/styles';
import { useFormik } from 'formik';
import { useParams } from 'react-router-dom';
import { GETUSERBYID } from '@Src/apollo/client/query/user';
import { GETROLES } from '@Src/apollo/client/query/rol';
import { UPDATEUSER } from '@Src/apollo/client/mutation/user';

type Props = {
  callback?: (data?: IStore) => void;
};

const UpdateUserModal: FC<Props> = (props) => {
  const { callback } = props;
  const params = useParams();
  const [isOpen, setIsOpen] = useAtom(UpdateUserModalAtom);

  const { data: dataRole } = useQuery<IQueryFilter<'getRoles'>>(GETROLES);

  const [updateUser, { loading }] = useMutation(UPDATEUSER);
  const { data } = useQuery(GETUSERBYID, {
    variables: {
      id: isOpen
    }
  });

  const formik = useFormik({
    initialValues: {
      name: data?.getUserById?.name ?? '',
      lastname: data?.getUserById?.lastname ?? '',
      email: data?.getUserById?.email ?? '',
      password: data?.getUserById?.password ?? null,
      role: data?.getUserById?.role?.id ?? '',
      store: params?.id
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateUser({
        variables: {
          id: isOpen,
          input: {
            ...values
          }
        }
      });
      setIsOpen('');
      callback?.();
    }
  });

  return (
    <>
      {isOpen !== '' && (
        <AtomWrapper
          onClick={() => {
            setIsOpen('');
          }}
          key={`${isOpen}`}
          customCSS={css`
            background-color: #1a1a1a5c;
            border-radius: 4px;
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            right: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px 0px;
            z-index: 9999;
          `}
        >
          <AtomWrapper
            onClick={(e) => {
              e.stopPropagation();
            }}
            customCSS={css`
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: center;
              padding: 30px 30px;
              width: 100%;
              height: max-content;
              max-width: 600px;
              max-height: 600px;
              background-color: #2e2e35;
              border-radius: 4px;
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
                  loading={loading}
                  customCSS={css`
                    width: 100%;
                    padding: 8px 10px;
                    background-color: #f1576c;
                  `}
                  onClick={() => {
                    formik.submitForm();
                  }}
                >
                  Edit User
                </AtomButton>
              </AtomWrapper>
            </AtomWrapper>
          </AtomWrapper>
        </AtomWrapper>
      )}
    </>
  );
};

export default UpdateUserModal;
