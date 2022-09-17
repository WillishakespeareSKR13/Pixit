import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { LoaderProps } from './types';

export const LoaderContainer = styled.div<LoaderProps>`
  ${({ type, width, height, backgroundColor }) =>
    type === 'small'
      ? css`
          width: ${width || 'max-content'};
          height: ${height || 'max-content'};
          background-color: ${backgroundColor || 'transparent'};
        `
      : css`
          width: 100%;
          height: 100vh;
          position: fixed;
          z-index: 9999;
          backdrop-filter: blur(12px);
          top: 0;
          left: 0;
          background-color: ${backgroundColor || '#1a1a1fd2'};
        `};
  background-image: ${({ backgroundImage }) => backgroundImage || `none`};
  background-size: cover;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${({ customCSS }) => customCSS};
`;
