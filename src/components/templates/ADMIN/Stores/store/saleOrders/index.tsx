import { css } from '@emotion/react';
import { InputDatesStyles, InputStyles, TableStyles } from '@Src/styles';
import { AtomButton, AtomTable, AtomText, AtomWrapper } from '@sweetsyui/ui';
import { IQueryFilter } from 'graphql';
import React, { FC, useState } from 'react';
import { arrayToCsv, downloadCsv } from '..';
import { convertDate, convertDateWithOptions } from '@Src/utils/convertDate';
import { useQuery } from '@apollo/client';
import { GETSALEORDES } from '@Src/apollo/client/query/saleOrder';
import { useRouter } from 'next/router';
import AtomInput from '../../../../../@atoms/AtomInput';
import { useFormik } from 'formik';

const today = new Date();

const SaleOrder: FC = () => {
  const [dateInitial, setdateInitial] = useState(
    new Date(today.setHours(0, 0, 0, 0))
  );
  const [dateFinal, setdateFinal] = useState(today);
  const router = useRouter();
  const { data: dataOrders } = useQuery<IQueryFilter<'getSaleOrders'>>(
    GETSALEORDES,
    {
      skip: !router?.query?.id?.[1],
      variables: {
        filter: {
          store: router?.query?.id?.[1]
        }
      }
    }
  );

  const formik = useFormik({
    initialValues: {
      dateinitial: dateInitial,
      datefinal: dateFinal,
      datebetween: false
    },
    // enableReinitialize: true,
    // validationSchema: () => {
    //   // Yup.object({});
    // },
    onSubmit: (values) => {
      setdateFinal(new Date(values.datefinal));
      setdateInitial(new Date(values.dateinitial));
      formik.setFieldValue('datebetween', true);
    }
  });
  return (
    <>
      <AtomWrapper flexDirection="row">
        <AtomInput
          id="dateinitial"
          formik={formik}
          type="date"
          maxDate={today.toLocaleDateString('en-ca')}
          customCSS={css`
            ${InputStyles}
            ${InputDatesStyles}
          `}
        />
        <AtomInput
          id="datefinal"
          formik={formik}
          type="date"
          maxDate={today.toLocaleDateString('en-ca')}
          customCSS={css`
            ${InputStyles}
            ${InputDatesStyles}
          `}
        />

        <AtomButton
          onClick={() => {
            formik.submitForm();
          }}
        >
          Search
        </AtomButton>
      </AtomWrapper>
      <AtomWrapper
        customCSS={css`
          max-width: 100%;
          overflow-x: scroll;
        `}
      >
        <AtomTable
          customCSS={TableStyles}
          data={dataOrders?.getSaleOrders
            ?.map((order) => ({
              ...order,
              createdAt: new Date(Number(order?.createdAt) ?? 0)
            }))
            .sort((a, b) =>
              a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
            )
            .filter((order) =>
              formik.values.datebetween === false
                ? true
                : order.createdAt.getTime() >= dateInitial.getTime() &&
                  order.createdAt.getTime() <= dateFinal.getTime()
            )}
          columns={[
            {
              title: 'Details',
              view: (item) => (
                <AtomWrapper
                  flexDirection="row"
                  customCSS={css`
                    gap: 10px;
                  `}
                >
                  <AtomButton
                    onClick={() => {
                      router.push({
                        pathname: `${router.pathname}/${item?.id}`,
                        query: {
                          ...router.query
                        }
                      });
                    }}
                    customCSS={css`
                      padding: 8px 20px;
                      background-color: #f1576c;
                    `}
                  >
                    Details
                  </AtomButton>
                  {item?.board?.map((e) => (
                    <AtomButton
                      key={e?.id}
                      onClick={() => {
                        const pdf = e?.pdf;
                        if (pdf) {
                          const a = document.createElement('a');
                          a.href = pdf;
                          a.download = 'invoice.pdf';
                          a.click();
                        }
                      }}
                      customCSS={css`
                        padding: 8px 20px;
                        background-color: #f1576c;
                      `}
                    >
                      PDF
                    </AtomButton>
                  ))}
                  {item?.colorsaleorder?.map((e) => (
                    <AtomButton
                      key={e?.id}
                      onClick={() => {
                        const map =
                          e?.colors?.map((e) => [
                            `${e?.color?.name}`,
                            `${e?.color?.color}`,
                            `${e?.quantity}`
                          ]) ?? [];
                        const csv =
                          arrayToCsv([['Color', 'Code', 'Quantity'], ...map]) ??
                          '';
                        downloadCsv(
                          csv,
                          `${e?.id}_${convertDate(new Date())}.csv`
                        );
                      }}
                      customCSS={css`
                        padding: 8px 20px;
                        background-color: #f1576c;
                      `}
                    >
                      CSV
                    </AtomButton>
                  ))}
                </AtomWrapper>
              )
            },
            {
              title: 'Date',
              view: (item) => (
                <>{convertDateWithOptions(`${item?.createdAt}`)}</>
              )
            },
            {
              title: 'Product',
              view: (item) => (
                <>
                  {`${item?.board?.length ?? 0 > 0 ? 'Board ' : ''}`}
                  {`${item?.product?.length ?? 0 > 0 ? ', Product' : ''}`}
                </>
              )
            },
            {
              title: 'Name',
              view: (item) => (
                <>
                  <AtomText
                    as="p"
                    //   title={[
                    //     item?.board?.map((board) => board?.board?.title),
                    //     item?.product?.map((product) => product?.name)
                    //   ]
                    //     .flat()
                    //     .join(', ')}
                    customCSS={css`
                      color: #dfdfdf;
                      white-space: nowrap;
                      overflow: hidden;
                      font-weight: 600;
                      max-width: 170px;
                      text-overflow: ellipsis;
                    `}
                  >
                    {[
                      item?.board?.map((board) => board?.board?.title),
                      item?.product?.map((product) => product?.name)
                    ]
                      .flat()
                      .join(', ')}
                  </AtomText>
                </>
              )
            },
            {
              title: 'Quantity',
              view: (item) => <>{`${item?.quantity}`}</>
            },
            {
              title: 'Status',
              view: (item) => <>{`${item?.status}`}</>
            },
            {
              title: 'Seller',
              view: (item) => <>{`${item?.customer?.name ?? 'WEBSITE'}`}</>
            },
            {
              title: 'Price',
              view: (item) => <>{`$ ${item?.total}`}</>
            }
          ]}
        />
      </AtomWrapper>
    </>
  );
};
export default SaleOrder;
