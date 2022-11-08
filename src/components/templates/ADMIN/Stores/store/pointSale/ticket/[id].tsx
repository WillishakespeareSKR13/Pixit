import { useMutation, useQuery } from '@apollo/client';
import { css } from '@emotion/react';
import { GETSALEORDERBYID } from '@Src/apollo/client/query/saleOrder';
import {
  AtomButton,
  AtomImage,
  AtomInput,
  AtomLoader,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';
import Confetti, { ConfettiConfig } from 'react-dom-confetti';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import DownloadTicket from '@Src/components/@organisms/DownloadTicket';
import { IQueryFilter } from 'graphql';
import { GETSTOREBYID } from '@Src/apollo/client/query/stores';
import { useParams } from 'react-router-dom';
import { useAlert } from '@Src/hooks/alertContext';
import {
  SENDEMAIL,
  UPDATESALEORDER
} from '@Src/apollo/client/mutation/saleOrder';
import { toDataURL } from 'qrcode';
import uploadImage from '@Src/utils/uploadImage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConfettiComponent = Confetti as any;

const config = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: '200',
  dragFriction: 0.08,
  duration: 3000,
  stagger: '8',
  width: '6px',
  height: '6px',
  perspective: '500px',
  colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
} as unknown as ConfettiConfig;

const CompleteOrderPay = () => {
  const router = useRouter();
  const params = useParams();
  const [qrImages, setQrImages] = useState<string[]>([]);
  const [sendEmail, setSendEmail] = useState(false);
  const { data } = useQuery<IQueryFilter<'getSaleOrderById'>>(
    GETSALEORDERBYID,
    {
      skip: !params?.order,
      variables: {
        id: params?.order
      }
    }
  );

  const { data: dataById } = useQuery(GETSTOREBYID, {
    variables: {
      id: params?.id
    }
  });

  const [EXESENDEMAIL, { loading: loadingSend }] = useMutation(SENDEMAIL);

  const [EXEUPDATESALEORDER] = useMutation(UPDATESALEORDER);

  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    const setData = async () => {
      const images =
        data?.getSaleOrderById?.board?.map(async (item) => {
          const toDataUrl = await toDataURL(item?.pdf || '')?.then(
            (res) => res
          );
          return toDataUrl;
        }) ?? [];
      setQrImages(await Promise.all(images));
    };
    setData();
  }, [data]);

  const [email, setEmail] = useState('');
  const { insertAlert } = useAlert();

  const pdf = DownloadTicket({
    id: params?.order,
    qrs: qrImages,
    store: dataById?.getStoreById
  });

  useEffect(() => {
    if (pdf && loadingTicket) {
      const uploadI = async () => {
        const BlobToFile = (blob: Blob, fileName: string) => {
          const file = new File([blob], fileName, {
            type: blob?.type,
            lastModified: Date.now()
          });
          return file;
        };
        const urlPdf = await uploadImage(
          BlobToFile(pdf?.blob as Blob, `Ticket.pdf`),
          {
            name: '.pdf',
            orgcode: 'LGO-0001'
          }
        );
        setLoadingTicket(false);
        EXEUPDATESALEORDER({
          variables: {
            id: data?.getSaleOrderById?.id,
            input: {
              ticket: urlPdf
            }
          }
        });
      };
      uploadI();
    }
  }, [pdf]);

  return (
    <AtomWrapper
      backgroundColor="#1a1a1f"
      height="100vh"
      alignItems="center"
      justifyContent="center"
      customCSS={css`
        overflow: hidden;
      `}
    >
      {loadingTicket && (
        <AtomLoader
          isLoading
          backgroundColor="transparent"
          colorLoading="#ffffff"
        />
      )}
      <AtomWrapper
        customCSS={css`
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
        `}
      >
        <ConfettiComponent active={!loadingTicket} config={config} />
      </AtomWrapper>
      {data?.getSaleOrderById && (
        <AtomWrapper
          maxWidth="max-content"
          borderRadius="5px"
          backgroundColor="#2e2e35"
          padding="60px 60px"
          justifyContent="center"
          alignItems="center"
          customCSS={css`
            gap: 10px;
          `}
        >
          <AtomText
            customCSS={css`
              text-align: center;
              max-width: 340px;
              font-size: 20px;
              font-weight: 600;
              color: #fff;
            `}
          >
            You have successfully paid for this order.
          </AtomText>
          <AtomImage
            alt="success"
            src="/images/check-mark.png"
            height="120px"
            width="max-content"
            margin="40px 0"
          />

          {sendEmail ? (
            <>
              <AtomText
                customCSS={css`
                  width: 100%;
                  text-align: left;
                  font-size: 12px;
                  font-weight: 600;
                  color: #fff;
                  margin-bottom: 5px;
                `}
              >
                Email sended to {email}
              </AtomText>
            </>
          ) : (
            <>
              <AtomText
                customCSS={css`
                  width: 100%;
                  text-align: left;
                  font-size: 12px;
                  font-weight: 600;
                  color: #fff;
                  margin-bottom: 5px;
                `}
              >
                Send pdfs and tickets by email
              </AtomText>

              <AtomWrapper
                customCSS={css`
                  flex-direction: row;
                  justify-content: space-between;
                  align-items: center;
                  gap: 20px;
                `}
              >
                <AtomInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  customCSS={css`
                    width: 100%;
                  `}
                />
                <AtomButton
                  loading={loadingSend}
                  onClick={() => {
                    const validEmail = email.match(
                      /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/g
                    );

                    if (validEmail) {
                      EXESENDEMAIL({
                        variables: {
                          id: params?.order,
                          email
                        }
                      }).then(() => {
                        setSendEmail(true);
                        insertAlert({
                          id: `${params?.order}`,
                          type: 'success',
                          message: 'Email sent successfully'
                        });
                      });
                    }
                  }}
                >
                  Send
                </AtomButton>
              </AtomWrapper>
            </>
          )}
          <AtomButton
            onClick={() => {
              router.push(
                `/dashboard/${[...(router?.query?.id ?? [])]
                  ?.filter((_, id) => id < 3)
                  .join('/')}`
              );
            }}
            customCSS={css`
              border: 2px solid #48d496;
              background-color: #48d496;
              span {
                font-size: 12px;
                font-weight: 600;
                color: #fff;
              }
            `}
          >
            <AtomText>Back to PointSale</AtomText>
          </AtomButton>
          {loadingTicket ? (
            <AtomButton
              customCSS={css`
                border: 2px solid #48d496;
                background-color: transparent;
                span {
                  font-size: 12px;
                  font-weight: 600;
                  color: #48d496;
                }
              `}
            >
              <AtomText>Loading...</AtomText>
            </AtomButton>
          ) : (
            <AtomButton
              onClick={() => {
                const link = document.createElement('a');
                link.href = `${pdf?.url}`;
                link.download = `ticket-${params?.order}.pdf`;
                link.click();
              }}
              customCSS={css`
                border: 2px solid #48d496;
                background-color: transparent;
                span {
                  font-size: 12px;
                  font-weight: 600;
                  color: #48d496;
                }
              `}
            >
              <AtomText>Download Ticket </AtomText>
            </AtomButton>
          )}
        </AtomWrapper>
      )}
    </AtomWrapper>
  );
};

export default CompleteOrderPay;
