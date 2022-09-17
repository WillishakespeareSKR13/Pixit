import { FC } from 'react';
import { LoaderContainer } from './style';
import { LoaderProps } from './types';
import Lottie, { Options } from 'react-lottie';
import animation from './LEGO_loader.json';
// import { AtomText } from '@sweetsyui/ui';
// import { css } from '@emotion/react';

const options = {
  loop: true,
  autoplay: true,
  prerender: true,
  animationData: animation
} as Options;

const AtomLoading: FC<LoaderProps> = (props) => {
  const { isLoading } = props;
  return isLoading ? (
    <LoaderContainer {...props}>
      <Lottie
        options={options}
        speed={6}
        width="420px"
        height="420px"
        isClickToPauseDisabled
      />
      {/* <AtomText
        customCSS={css`
          color: white;
          font-size: 26px;
          max-width: 400px;
          line-height: 1.4;
          text-align: center;
        `}
      >
        Give us a minute while we build your piece of art
      </AtomText> */}
    </LoaderContainer>
  ) : null;
};

export default AtomLoading;
