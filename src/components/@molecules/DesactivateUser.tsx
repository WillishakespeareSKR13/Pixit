import { useMutation } from '@apollo/client';
import { css } from '@emotion/react';
import { UPDATEUSER } from '@Src/apollo/client/mutation/user';
import { AtomButton, AtomLoader, AtomText, AtomWrapper } from '@sweetsyui/ui';
import { FC, useState } from 'react';

type Props = {
  id: string;
  callback?: () => void;
};

const DesactivateUser: FC<Props> = (props) => {
  const { id, callback } = props;
  const [open, setOpen] = useState(false);
  const [EXEUPDATEUSER, { loading }] = useMutation(UPDATEUSER);
  return (
    <AtomWrapper
      customCSS={css`
        flex-direction: row;
        align-items: center;
        width: ${open ? '520px' : '100px'};
        transition: all 0.3s ease-in-out;
      `}
    >
      {!open && (
        <AtomButton
          onClick={() => {
            setOpen(true);
          }}
          customCSS={css`
            font-size: 10px;
            padding: 8px 20px;
            background-color: #2e2e35;
            z-index: 1;
          `}
        >
          Desactivate
        </AtomButton>
      )}
      {open && (
        <AtomWrapper
          customCSS={css`
            height: 31px;
            width: 100%;
            align-items: center;
            justify-content: space-between;
            flex-direction: row;
          `}
        >
          <AtomWrapper
            customCSS={css`
              flex-direction: row;
              width: max-content;
              justify-content: space-between;
              gap: 10px;
            `}
          >
            <AtomButton
              customCSS={css`
                font-size: 10px;
                padding: 8px 15px;
                background-color: #2e2e35;
              `}
              onClick={() => setOpen(false)}
            >
              Cancel
            </AtomButton>
            <AtomButton
              customCSS={css`
                font-size: 10px;
                padding: 8px 15px;
                background-color: #f1576c;
              `}
              onClick={() => {
                EXEUPDATEUSER({
                  variables: {
                    id: id,
                    input: {
                      disabled: true
                    }
                  }
                }).then(() => {
                  setOpen(false);
                  callback?.();
                });
              }}
            >
              {loading ? (
                <AtomLoader
                  isLoading
                  type="small"
                  colorLoading="white"
                  widthLoader="2px"
                  customCSS={css`
                    .lds-ring {
                      width: 15px;
                      height: 15px;
                      div {
                        margin: 1px 2px;
                        width: 14px;
                        height: 14px;
                      }
                    }
                  `}
                />
              ) : (
                'Desactivate'
              )}
            </AtomButton>
          </AtomWrapper>
          <AtomText
            customCSS={css`
              color: #e6e1df;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
              white-space: nowrap;
              opacity: ${open ? 1 : 0};
              padding-right: 10px;
              transition: all 0.3s ease-in-out;
            `}
          >
            Are you sure you want to desactivate this user?
          </AtomText>
        </AtomWrapper>
      )}
    </AtomWrapper>
  );
};

export default DesactivateUser;
