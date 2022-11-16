import { IProducts } from 'graphql';
import React, { FC } from 'react';
import { SerializedStyles } from '@emotion/utils';
import { AtomButton, AtomImage, AtomText, AtomWrapper } from '@sweetsyui/ui';
import { css } from '@emotion/react';
import { useAtom } from 'jotai';
import { ICart, setCartAtom } from '@Src/jotai/cart';

interface MoleculeCardSheetType extends IProducts {
  customCSS?: SerializedStyles;
}

export const sheetID = 'SHEET-0001';

const MoleculeCardSheet: FC<MoleculeCardSheetType> = (props) => {
  const [cart, setCart] = useAtom(setCartAtom);
  const { customCSS, color } = props;
  return (
    <AtomButton
      onClick={() => {
        const isCart = cart.find((item) => item.id === sheetID);
        if (isCart) {
          setCart({
            key: 'ADDQUANTITY',
            payload: sheetID
          });
        } else {
          setCart({
            key: 'ADDCART',
            payload: {
              id: sheetID,
              type: 'SHEET',
              quantity: 1
            } as ICart
          });
        }
      }}
      padding="0"
      backgroundColor="transparent"
      customCSS={css`
        flex-basis: 150px;
        flex-grow: 1;
        height: 170px;
        background-color: #202026;
        justify-content: space-between;
        border-radius: 8px;
        padding: 10px;
        ${customCSS}
      `}
    >
      <AtomWrapper alignItems="center" padding="10px">
        <AtomImage
          src={'/images/board.png'}
          alt={'/images/board.png'}
          customCSS={css`
            width: 70px;
            height: 70px;
            background-color: ${color?.color ?? '#1a1a1f'};
            border-radius: 50%;
            img {
              object-fit: contain;
              padding: 10px;
            }
          `}
        />
      </AtomWrapper>
      <AtomWrapper padding="0" alignItems="center">
        <AtomText
          customCSS={css`
            color: #dfdfdf;
            font-size: 16px;
            font-weight: 600;
            max-width: 100px;
            text-overflow: ellipsis;
            overflow: hidden;
            text-align: center;
            white-space: nowrap;
          `}
        >
          Sheet
        </AtomText>

        <AtomText
          customCSS={css`
            color: #dfdfdf;
            font-weight: 600;
            font-size: 12px;
            max-width: 100px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          `}
        >
          Add new sheet
        </AtomText>
      </AtomWrapper>
    </AtomButton>
  );
};
export default MoleculeCardSheet;
