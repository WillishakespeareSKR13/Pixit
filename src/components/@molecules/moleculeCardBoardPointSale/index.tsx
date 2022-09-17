import { css, SerializedStyles } from '@emotion/react';
import { OpenModal } from '@Src/redux/actions/modal';
import { AtomButton, AtomImage, AtomText, AtomWrapper } from '@sweetsyui/ui';
import { IBoard } from 'graphql';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';

interface MoleculeCardBoardAllType extends IBoard {
  customCSS?: SerializedStyles;
}

const MoleculeCardBoardPointSale: FC<MoleculeCardBoardAllType> = (props) => {
  const { customCSS } = props;
  const dispatch = useDispatch();
  return (
    <AtomButton
      onClick={() => {
        dispatch(
          OpenModal({
            modal: true
          })
        );
      }}
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
          src={`/images/board.png`}
          alt={`board-image`}
          customCSS={css`
            height: 70px;
            width: 70px;
            background-color: #1a1a1f;
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
          `}
        >
          Board
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
          Add new board
        </AtomText>
      </AtomWrapper>

      {/* <AtomButton
          customCSS={css`
            width: 100%;
            margin: 10px 10px 10px 0px;
            background-color: #f1576c;
            :hover {
              background-color: #d9364c;
            }
            transition: background-color 0.3s ease;
          `}
          onClick={() => {
            dispatch(
              OpenModal({
                modal: true
              })
            );
          }}
        >
          <AtomText
            customCSS={css`
              color: #dfdfdf;
              font-weight: 600;
              font-size: 12px;
            `}
          >
            Add to Cart
          </AtomText>
        </AtomButton> */}
    </AtomButton>
  );
};
export default MoleculeCardBoardPointSale;
