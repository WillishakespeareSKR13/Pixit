import {
  AtomButton,
  AtomImage,
  AtomInput,
  AtomLoader,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';
import { FC, useEffect, useState } from 'react';

import { css } from '@emotion/react';
import { useMutation, useQuery } from '@apollo/client';
import { IQueryFilter, IStore } from 'graphql';
import { GETSTOREBYID } from '@Src/apollo/client/query/stores';
import { useAtom } from 'jotai';
import { SheetModalAtom } from '@Src/jotai/sheetModal';
import { InputStyles } from '@Src/styles';
import { UPDATESTORE } from '@Src/apollo/client/mutation/store';

type Props = {
  id?: string;
  callback?: (data?: IStore) => void;
};

const SheetModal: FC<Props> = (props) => {
  const { id, callback } = props;
  const [isOpen, setIsOpen] = useAtom(SheetModalAtom);
  const [saleOrder, setSaleOrder] = useState<IStore | undefined>();
  const [quantity, setQuantity] = useState(0);

  const { data, refetch } = useQuery<IQueryFilter<'getStoreById'>>(
    GETSTOREBYID,
    {
      variables: {
        id: id
      }
    }
  );

  const [EXEUPDATESTORE, { loading }] = useMutation(UPDATESTORE);

  useEffect(() => {
    setSaleOrder(data?.getStoreById);
    setQuantity(data?.getStoreById?.sheets ?? 0);
  }, [data]);

  return (
    <>
      {isOpen && (
        <AtomWrapper
          onClick={() => {
            setIsOpen(false);
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
          {!saleOrder && (
            <AtomLoader
              type="small"
              isLoading
              width="400px"
              colorLoading="#313139"
            />
          )}
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
                max-width: 100%;
                gap: 20px;
              `}
            >
              <AtomWrapper
                customCSS={css`
                  width: 100%;
                  align-items: center;
                  justify-content: flex-start;
                  flex-direction: column;
                  padding: 10px 10px 15px 10px;
                  border-radius: 8px;
                  background-color: #202026;
                `}
              >
                <AtomImage
                  src={`/images/board.png`}
                  alt={`/images/board.png`}
                  height="120px"
                  width="100%"
                  customCSS={css`
                    overflow: hidden;
                    border-radius: 4px;
                    img {
                      object-fit: contain !important;
                    }
                  `}
                />
                <AtomText
                  width="100%"
                  align="center"
                  fontSize="16px"
                  fontWeight="bold"
                  color="#dfdfdf"
                >
                  Boards Units
                </AtomText>

                <AtomText
                  align="center"
                  color={
                    quantity === Number(saleOrder?.sheets ?? 0)
                      ? '#dfdfdf'
                      : Number(saleOrder?.sheets ?? 0) > quantity
                      ? '#f1576c'
                      : '#10b31e'
                  }
                  fontSize="14px"
                  fontWeight="bold"
                >
                  {quantity === Number(saleOrder?.sheets ?? 0)
                    ? ''
                    : Number(saleOrder?.sheets ?? 0) > quantity
                    ? ''
                    : '+'}

                  {quantity - Number(saleOrder?.sheets ?? 0) === 0
                    ? ''
                    : quantity - Number(saleOrder?.sheets ?? 0)}
                </AtomText>
                <AtomText
                  align="center"
                  color={
                    quantity === Number(saleOrder?.sheets ?? 0)
                      ? '#dfdfdf'
                      : Number(saleOrder?.sheets ?? 0) > quantity
                      ? '#f1576c'
                      : '#10b31e'
                  }
                  fontSize="14px"
                  fontWeight="bold"
                >
                  {quantity}
                </AtomText>
              </AtomWrapper>

              <AtomWrapper
                customCSS={css`
                  flex-direction: row;
                  gap: 20px;
                `}
              >
                <AtomInput
                  customCSS={css`
                    width: 100%;
                    ${InputStyles}
                  `}
                  type="number"
                  value={`${quantity}`}
                  onChange={(e) => {
                    setQuantity(Number(e.target.value));
                  }}
                />
                <AtomButton
                  loading={loading}
                  onClick={async () => {
                    await EXEUPDATESTORE({
                      variables: {
                        id: id,
                        input: {
                          sheets: quantity
                        }
                      }
                    });
                    await refetch();
                    setIsOpen(false);
                    callback?.(saleOrder);
                  }}
                >
                  Add
                </AtomButton>
              </AtomWrapper>
            </AtomWrapper>
          </AtomWrapper>
        </AtomWrapper>
      )}
    </>
  );
};

export default SheetModal;
