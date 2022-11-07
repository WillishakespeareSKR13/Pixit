import { css } from '@emotion/react';
import {
  AtomButton,
  AtomImage,
  AtomModal,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';

import { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react';

type AtomModalImageProps = {
  images?: string[];
  state?: boolean;
  setState?: Dispatch<SetStateAction<boolean>>;
  selected?: number;
  setSelected?: Dispatch<SetStateAction<number>>;
  x?: number;
  y?: number;
};

const AtomModalImage: FC<AtomModalImageProps> = (props) => {
  const { images, setSelected, state, setState, x } = props;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setState?.(false);
      }
    };

    document.addEventListener(`mousedown`, handleClickOutside, true);
    return () => {
      document.removeEventListener(`mousedown`, handleClickOutside, true);
    };
  }, [ref]);
  return (
    <AtomModal
      isOpen={state}
      componentProps={{
        containerProps: {
          customCSS: css`
            position: fixed;
            width: 100vw;
            height: 100vh;
            left: 0;
            top: 0;
            background-color: #0000008a;
            backdrop-filter: blur(12px);
          `
        },
        wrapperProps: {
          width: 'max-content',
          height: '80vh',
          backgroundColor: 'transparent',
          position: 'relative',
          margin: '60px 0 0 0'
        }
      }}
      component={
        <>
          <AtomWrapper
            maxWidth="100%"
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
            customCSS={css`
              display: grid;
              grid-template-columns: repeat(${x}, 1fr);
            `}
          >
            {images?.map((image, idx) => (
              <AtomButton
                key={image}
                customCSS={css`
                  display: flex;
                  padding: 0px;
                  overflow: hidden;
                  border-radius: 0px;
                  background-color: transparent;
                `}
                onClick={() => {
                  setSelected?.(idx);
                }}
              >
                <AtomImage
                  height="160px"
                  width="160px"
                  alt="image"
                  src={`${image}`}
                  customCSS={css`
                    /* cursor: pointer; */
                    img {
                      /* cursor: pointer; */
                      object-fit: contain;
                    }
                  `}
                />
              </AtomButton>
            ))}
          </AtomWrapper>
          <AtomButton
            onClick={() => setState?.(false)}
            customCSS={css`
              padding: 0px;
              background-color: transparent;
              position: absolute;
              right: 0;
              top: -40px;

              z-index: 9999;
              * {
                color: #fff;
                font-size: 24px;
                font-weight: bold;
              }
            `}
          >
            <AtomText fontSize="24px" color="#fff">
              X
            </AtomText>
          </AtomButton>
        </>
      }
    />
  );
};

export default AtomModalImage;
