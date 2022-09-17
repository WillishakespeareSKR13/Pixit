import { css } from '@emotion/react';
import { InputStyles } from '@Src/styles';
import {
  AtomButton,
  AtomInput,
  AtomLoader,
  AtomModal,
  AtomWrapper
} from '@sweetsyui/ui';
import { useFormik } from 'formik';
import React, { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react';
import { RoleModalType } from './index';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { UPDATEROLE } from '@Src/apollo/client/mutation/rol';

interface ModalUpdateColorType {
  state: RoleModalType;
  setState: Dispatch<SetStateAction<RoleModalType>>;
}

const ModalUpdateColor: FC<ModalUpdateColorType> = (props) => {
  const { state, setState } = props;
  const [updateRole, { loading: loadingUpdateRole }] = useMutation(UPDATEROLE, {
    onCompleted: () => {
      setState({
        openModal: false
      });
    }
  });
  const formik = useFormik({
    initialValues: {
      name: state?.name ?? '',
      label: state?.label ?? ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      label: Yup.string().required('Required')
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      updateRole({
        variables: {
          id: state?.id,
          input: {
            name: values.name,
            label: values.label
          }
        }
      });
    }
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setState?.({ openModal: false });
      }
    };

    document.addEventListener(`mousedown`, handleClickOutside, true);
    return () => {
      document.removeEventListener(`mousedown`, handleClickOutside, true);
    };
  }, [ref]);

  return (
    <AtomModal
      isOpen={state.openModal}
      componentProps={{
        wrapperProps: {
          refObject: ref,
          backgroundColor: '#2e2e35',
          padding: '30px 30px',
          height: 'max-content'
        }
      }}
      component={
        <>
          <AtomWrapper
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
          >
            <AtomLoader
              isLoading={loadingUpdateRole}
              backgroundColor="transparent"
              colorLoading="#f1576c"
            />
            <AtomWrapper
              width="50%"
              alignItems="center"
              flexDirection="row"
              flexWrap="wrap"
              customCSS={css`
                gap: 0 20px;
              `}
            >
              <AtomInput
                id="name"
                type="text"
                label="Name"
                labelFontSize="14px"
                labelWidth="50%"
                formik={formik}
                customCSS={InputStyles}
              />

              <AtomInput
                id="label"
                type="text"
                label="Label"
                labelFontSize="14px"
                labelWidth="50%"
                formik={formik}
                defaultText="Select Color"
                customCSS={InputStyles}
              />
            </AtomWrapper>
          </AtomWrapper>
          <AtomButton
            type="submit"
            onClick={() => {
              formik.validateForm();
              formik.submitForm();
            }}
          >
            Update Role
          </AtomButton>
        </>
      }
    />
  );
};
export default ModalUpdateColor;
