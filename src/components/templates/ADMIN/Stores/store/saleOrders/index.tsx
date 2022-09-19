import { css } from '@emotion/react';
import { InputDatesStyles, InputStyles, TableStyles } from '@Src/styles';
import {
  AtomButton,
  AtomIcon,
  AtomTable,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';
import { IQueryFilter } from 'graphql';
import React, { FC, useState } from 'react';
import { arrayToCsv, downloadCsv } from '..';
import { convertDate, convertDateWithOptions } from '@Src/utils/convertDate';
import { useQuery } from '@apollo/client';
import { GETSALEORDES } from '@Src/apollo/client/query/saleOrder';
import { useRouter } from 'next/router';
import AtomInput from '../../../../../@atoms/AtomInput';
import DashWithTitle from '@Src/components/layouts/DashWithTitle';

const initDate = new Date()?.toISOString()?.split('T')[0];

const SaleOrder: FC = () => {
  const [dateInitial, setdateInitial] = useState(initDate);
  const [dateFinal, setdateFinal] = useState(initDate);
  const [search, setSearch] = useState('');
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

  return (
    <DashWithTitle
      url={{
        pathname: router.pathname,
        query: {
          id: Array.isArray(router.query.id)
            ? router.query.id.filter((_, idx, arr) => idx !== arr.length - 1)
            : router.query.id
        }
      }}
      title="Sale Orders"
      button={
        <AtomWrapper
          customCSS={css`
            flex-direction: row;
            width: max-content;
            gap: 20px;
          `}
        >
          <AtomButton
            onClick={() => {
              const csv =
                arrayToCsv([
                  [
                    'Date',
                    'Product',
                    'Name',
                    'Quantity',
                    'Status',
                    'Seller',
                    'Price'
                  ],
                  ...(dataOrders?.getSaleOrders ?? [])?.map((item) => [
                    convertDateWithOptions(
                      `${new Date(Number(item?.createdAt) ?? 0)}`
                    ),
                    `${`${item?.board?.length ?? 0 > 0 ? 'Board ' : ''}`}${`${
                      item?.product?.length ?? 0 > 0 ? ', Product' : ''
                    }`}`,
                    [
                      item?.board?.map((board) => board?.board?.title),
                      item?.product?.map((product) => product?.name)
                    ]
                      .flat()
                      .join(', '),
                    `${item?.quantity}`,
                    `${item?.status}`,
                    `${item?.customer?.name ?? 'WEBSITE'}`,
                    `$ ${item?.total}`
                  ])
                ]) ?? '';
              downloadCsv(csv, `${convertDate(new Date())}.csv`);
            }}
          >
            Export CSV
          </AtomButton>
        </AtomWrapper>
      }
    >
      <AtomWrapper
        customCSS={css`
          width: 100%;
          height: max-content;
          gap: 20px;
        `}
      >
        <AtomWrapper
          flexDirection="row"
          customCSS={css`
            gap: 10px;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <AtomWrapper
            customCSS={css`
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-end;
              width: max-content;
              gap: 20px;
            `}
          >
            <AtomInput
              id="dateinitial"
              type="date"
              label="Data inicial"
              value={dateInitial}
              onChange={(e) => setdateInitial(e.target.value)}
              customCSS={css`
                ${InputStyles}
                ${InputDatesStyles}
              `}
            />
            <AtomInput
              id="datefinal"
              type="date"
              value={dateFinal}
              onChange={(e) => setdateFinal(e.target.value)}
              label="Date final"
              customCSS={css`
                ${InputStyles}
                ${InputDatesStyles}
              `}
            />
            {!(initDate === dateInitial && initDate === dateFinal) && (
              <AtomButton
                onClick={() => {
                  setdateInitial(initDate);
                  setdateFinal(initDate);
                }}
              >
                Clear
              </AtomButton>
            )}
          </AtomWrapper>

          <AtomWrapper
            customCSS={css`
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-end;
              width: max-content;
              gap: 20px;
            `}
          >
            <AtomInput
              id="search"
              type="text"
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              customCSS={css`
                ${InputStyles}
                ${InputDatesStyles}
              `}
            />
            {search && (
              <AtomButton
                onClick={() => {
                  setSearch('');
                }}
              >
                Clear
              </AtomButton>
            )}
          </AtomWrapper>
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
                a.createdAt < b.createdAt
                  ? 1
                  : a.createdAt > b.createdAt
                  ? -1
                  : 0
              )
              .filter((order) => {
                const isOnchangeDate =
                  initDate === dateInitial && initDate === dateFinal;
                if (isOnchangeDate) return true;
                const dateOne = new Date(dateInitial);
                const dateTwo = new Date(dateFinal);

                return order.createdAt >= dateOne && order.createdAt <= dateTwo;
              })
              .filter((order) => {
                if (!search) return true;
                const name = [
                  order?.board?.map((board) => board?.board?.title ?? '') ?? [],
                  order?.product?.map((product) => product?.name ?? '') ?? []
                ]?.find((name) =>
                  name
                    ?.toString()
                    ?.toLowerCase()
                    .includes(search?.toLowerCase())
                );
                return name;
              })}
            columns={[
              {
                title: 'Details',
                view: (item) => (
                  <AtomWrapper
                    flexDirection="row"
                    customCSS={css`
                      gap: 10px;
                      justify-content: flex-start;
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
                        padding: 0px 0px;
                        background-color: transparent;
                        border: 1px solid #f1576c;
                      `}
                    >
                      <AtomIcon
                        height="30px"
                        width="30px"
                        color="#f1576c"
                        icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/LGO-0001/assets/details.svg"
                      />
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
                          padding: 0px 0px;
                          background-color: transparent;
                          border: 1px solid #f1576c;
                        `}
                      >
                        <AtomIcon
                          height="30px"
                          width="30px"
                          color="#f1576c"
                          icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/LGO-0001/assets/pdf.svg"
                        />
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
                            arrayToCsv([
                              ['Color', 'Code', 'Quantity'],
                              ...map
                            ]) ?? '';
                          downloadCsv(
                            csv,
                            `${e?.id}_${convertDate(new Date())}.csv`
                          );
                        }}
                        customCSS={css`
                          padding: 0px 0px;
                          background-color: transparent;
                          border: 1px solid #f1576c;
                        `}
                      >
                        <AtomIcon
                          height="30px"
                          width="30px"
                          color="#f1576c"
                          icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/LGO-0001/assets/csv.svg"
                        />
                      </AtomButton>
                    ))}
                    {item?.ticket && (
                      <AtomButton
                        onClick={() => {
                          const ticket = item?.ticket;
                          if (ticket) {
                            const a = document.createElement('a');
                            a.href = ticket;
                            a.download = 'invoice.pdf';
                            a.click();
                          }
                        }}
                        customCSS={css`
                          padding: 5px;
                          background-color: transparent;
                          border: 1px solid #f1576c;
                        `}
                      >
                        <AtomIcon
                          height="20px"
                          width="20px"
                          color="#f1576c"
                          icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/LGO-0001/assets/bill-receipt.svg"
                        />
                      </AtomButton>
                    )}
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
      </AtomWrapper>
    </DashWithTitle>
  );
};
export default SaleOrder;
