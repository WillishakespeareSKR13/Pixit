import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { css, SerializedStyles } from '@emotion/react';
import { NEWCOLORSALEORDER } from '@Src/apollo/client/mutation/color';
import { NEWSALEORDERCASH } from '@Src/apollo/client/mutation/saleOrder';
import { GET_BOARDS } from '@Src/apollo/client/query/boards';
import { GETPRODUCTS } from '@Src/apollo/client/query/products';
import { PAYSALEORDERCASH } from '@Src/apollo/client/query/saleOrder';
import { GETUSERBYID, GETUSERS } from '@Src/apollo/client/query/user';
// import MoleculeCardBoard from '@Src/components/@molecules/moleculeCardBoard';
import MoleculeCardBoardPointSale from '@Src/components/@molecules/moleculeCardBoardPointSale';
import MoleculeCardProduct from '@Src/components/@molecules/moleculeCardProduct';
import DashWithTitle from '@Src/components/layouts/DashWithTitle';
import PageIndex from '@Src/components/pages/index';
import { colorsAtoms, ICart, setCartAtom } from '@Src/jotai/cart';
import { RootStateType } from '@Src/redux/reducer';

export type ItemCardShopType = {
  id: string;
  image: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  type: string;
  customCSS?: SerializedStyles;
};

import {
  AtomButton,
  AtomIcon,
  AtomImage,
  AtomInput,
  AtomLoader,
  AtomModal,
  AtomText,
  AtomWrapper
} from '@sweetsyui/ui';
import { IQueryFilter } from 'graphql';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const cashAtom = atom(null as null | number);
const payAtom = atom(false);
const payedAtom = atom(false);
const paymentsAtom = atom(null as null | string);
const cartOnlyBoardAtom = atom((get) =>
  get(setCartAtom).filter((e) => e.type === 'BOARD')
);
const cartOnlyProductAtom = atom((get) =>
  get(setCartAtom).filter((e) => e.type !== 'BOARD')
);
const sellerAtom = atom(null as null | string);
const taxAtom = atom(0);
const discountAtom = atom(0);

const cardTaxAtom = atom(null as null | number);

const PointSale: FC = () => {
  const [pay, setPay] = useAtom(payAtom);
  const [payments, setPayments] = useAtom(paymentsAtom);
  const [payed, setPayed] = useAtom(payedAtom);
  const [cash, setCash] = useAtom(cashAtom);
  const [cart, setCart] = useAtom(setCartAtom);
  const cartOnlyBoard = useAtomValue(cartOnlyBoardAtom);
  const cartOnlyProduct = useAtomValue(cartOnlyProductAtom);
  const [cardTax, setCardTax] = useAtom(cardTaxAtom);
  const [colors] = useAtom(colorsAtoms);
  const router = useRouter();
  const params = useParams();
  const [seller, setSeller] = useAtom(sellerAtom);
  const modal = useSelector((state: RootStateType) => state.modal);
  const user = useSelector((state: RootStateType) => state.user);
  const [changeSeller, setChangeSeller] = useState(false);

  const { data: getUserBId } = useQuery<IQueryFilter<'getUserById'>>(
    GETUSERBYID,
    {
      variables: {
        id: seller ?? user?.id
      }
    }
  );

  const getSeller = useMemo(() => getUserBId?.getUserById, [getUserBId]);

  const { data: boards } = useQuery<IQueryFilter<'getBoards'>>(GET_BOARDS);
  const { data, loading } = useQuery<IQueryFilter<'getProducts'>>(GETPRODUCTS, {
    variables: {
      filter: {
        store: router?.query?.id?.[1]
      }
    }
  });

  const cartOnlyBoardsLessColor = useMemo(
    () => Boolean(colors?.find((e) => e.rest / 50 > 0)),
    [colors, cartOnlyBoard]
  );

  useEffect(() => {
    const AddedColor = colors.map((e) => ({
      ...e,
      add: Math.ceil(e.rest / 50)
    }));

    AddedColor?.map((e) => {
      const product = data?.getProducts?.find(
        (color) => color?.color?.id === e.id
      );
      const isCart = cart.find((item) => item.id === product?.id);
      if (isCart) {
        Array.from({ length: Math.abs(e.add) }, () => {
          setCart({
            key: e.add > 0 ? 'ADDQUANTITY' : 'REMOVEQUANTITY',
            payload: product?.id
          });
        });
      } else {
        setCart({
          key: 'ADDCART',
          payload: {
            id: product?.id,
            type: 'PRODUCT',
            quantity: Math.abs(e.add),
            product: product
          } as ICart
        });
      }
    });
  }, [cartOnlyBoardsLessColor]);

  const { data: dataUsers } = useQuery<IQueryFilter<'getUsers'>>(GETUSERS, {
    variables: {
      skip: !params?.id,
      filter: {
        store: params?.id
      }
    }
  });

  const [EXENEWSALEORDER, { loading: load1 }] = useMutation(NEWSALEORDERCASH);
  const [EXENEWCOLORSALEORDER, { loading: load2 }] =
    useMutation(NEWCOLORSALEORDER);
  const [LAZYPAYSALEORDERCASH, { loading: load3 }] =
    useLazyQuery(PAYSALEORDERCASH);

  const [discount, setDiscount] = useAtom(discountAtom);

  const [tax, setTax] = useAtom(taxAtom);

  const SubTotal = useMemo(
    () =>
      cart.reduce((acc, item) => {
        const price =
          item.type === 'BOARD'
            ? boards?.getBoards
                ?.find((e) => e?.id === item.board?.id)
                ?.sizes?.find((e) => e?.id === item.board?.size)?.price
            : data?.getProducts?.find((e) => e?.id === item.product?.id)?.price;
        const moreColors =
          item.type === 'BOARD'
            ? undefined
            : Math.abs(
                Math.ceil(
                  (colors?.find(
                    (e) =>
                      e?.id ===
                      data?.getProducts?.find((e) => e?.id === item.product?.id)
                        ?.color?.id
                  )?.rest ?? 0) / 50
                )
              );

        const priceQuantity = (price ?? 0) * (moreColors ?? item.quantity);
        return acc + (priceQuantity ?? 0);
      }, 0),
    [cart, boards?.getBoards, data?.getProducts, colors]
  );
  const Discount = useMemo(
    () => Number((SubTotal * (discount / 100)).toFixed(2)),
    [SubTotal, discount]
  );

  const Tax = useMemo(
    () => Number((SubTotal * (tax / 100)).toFixed(2)),
    [SubTotal, tax]
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
      title="Products"
    >
      <AtomWrapper
        padding="0"
        flexDirection="row"
        customCSS={css`
          min-height: calc(100vh - 140px);
          gap: 20px;
        `}
      >
        <AtomWrapper
          width="70%"
          height="100%"
          customCSS={css`
            overflow: auto;
            justify-content: flex-start;
          `}
        >
          <AtomWrapper
            height="max-content"
            customCSS={css`
              flex-direction: row;
              justify-content: flex-start;

              flex-wrap: wrap;
              gap: 1rem;
            `}
          >
            {loading ? (
              <AtomWrapper
                customCSS={css`
                  width: 30.3%;
                  height: 300px;
                  background-color: #2e2e35;
                  justify-content: space-between;
                  border-radius: 8px;
                `}
              >
                <AtomLoader
                  isLoading
                  type="small"
                  width="100%"
                  height="100%"
                  colorLoading="white"
                />
              </AtomWrapper>
            ) : (
              <>
                <AtomWrapper
                  customCSS={css`
                    width: 100%;
                    height: max-content;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    gap: 15px;
                  `}
                >
                  <MoleculeCardBoardPointSale />
                  {data?.getProducts?.map((product) => (
                    <MoleculeCardProduct key={product?.id} {...product} />
                  ))}
                </AtomWrapper>
              </>
            )}
          </AtomWrapper>
        </AtomWrapper>
        <AtomWrapper
          width="30%"
          height="100%"
          customCSS={css`
            gap: 10px;
          `}
        >
          <AtomWrapper
            maxHeight="770px"
            justifyContent="flex-start"
            customCSS={css`
              height: 400px;
              overflow-y: auto;
              gap: 10px;
            `}
          >
            {cartOnlyBoard.map((e) => (
              <BOARD {...e} boards={boards} key={e.keyid} />
            ))}
            {cartOnlyBoard.length > 0 && (
              <SHEETS
                quantity={cartOnlyBoard?.reduce((acc, item) => {
                  const board = boards?.getBoards?.find(
                    (x) => x?.id === item.id
                  );
                  const size = board?.sizes?.find(
                    (x) => x?.id === item.board?.size
                  );
                  return acc + (size?.x ?? 0) * (size?.y ?? 0);
                }, 0)}
              />
            )}
            {cartOnlyProduct.map((e) => (
              <PRODUCT {...e} key={e.keyid} />
            ))}
          </AtomWrapper>

          <AtomWrapper
            height="100%"
            justifyContent="flex-end"
            customCSS={css`
              gap: 10px;
            `}
          >
            <AtomWrapper
              customCSS={css`
                width: 100%;
                flex-wrap: wrap;
                flex-direction: row;
                justify-content: flex-start;
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 5px;
              `}
            >
              {colors.map((e) => {
                return (
                  <AtomWrapper
                    key={e.color}
                    customCSS={css`
                      flex-direction: row;
                      max-width: max-content;
                      gap: 4px;
                      align-items: center;
                    `}
                  >
                    <AtomWrapper
                      customCSS={css`
                        width: 25px;
                        height: 25px;
                        padding: 4px;
                        background-color: ${e.color};
                        border: 1px solid #eeeeee;
                      `}
                    >
                      <AtomImage src={e.img} alt={e.img} />
                    </AtomWrapper>
                    <AtomText
                      customCSS={css`
                        ${e.rest > 0
                          ? css`
                              color: #e42222;
                            `
                          : css`
                              color: #14cf68;
                            `}
                        font-size: 10px;
                        font-weight: bold;
                      `}
                    >
                      {e.rest > 0 ? e.rest : `+${Math.abs(e.rest)}`}
                    </AtomText>
                  </AtomWrapper>
                );
              })}
            </AtomWrapper>
            {colors.length > 0 && (
              <AtomButton
                onClick={() => {
                  const AddedColor = colors.map((e) => ({
                    ...e,
                    add: Math.ceil(e.rest / 50)
                  }));
                  AddedColor?.map((e) => {
                    const product = data?.getProducts?.find(
                      (color) => color?.color?.id === e.id
                    );
                    const isCart = cart.find((item) => item.id === product?.id);
                    if (isCart) {
                      Array.from({ length: Math.abs(e.add) }, () => {
                        setCart({
                          key: e.add > 0 ? 'ADDQUANTITY' : 'REMOVEQUANTITY',
                          payload: product?.id
                        });
                      });
                    } else {
                      setCart({
                        key: 'ADDCART',
                        payload: {
                          id: product?.id,
                          type: 'PRODUCT',
                          quantity: Math.abs(e.add),
                          product: product
                        } as ICart
                      });
                    }
                  });
                }}
                width="100%"
                backgroundColor="#e6485d"
                color="white"
              >
                Just Enough Colors
              </AtomButton>
            )}
            <AtomWrapper
              flexDirection="row"
              flexWrap="wrap"
              customCSS={css`
                span {
                  font-size: 12px;
                  background-color: #202026;
                  border-radius: 4px;
                  border: 2px solid #2e2e35;
                  color: #ffffff;
                  padding: 8px 15px;

                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                }
              `}
            >
              <AtomText width="70%">Subtotal</AtomText>
              <AtomText width="30%" align="right">
                {`$${SubTotal}`}
              </AtomText>
              <AtomText
                width="70%"
                customCSS={css`
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  gap: 20px;
                `}
              >
                Discount
                <AtomWrapper
                  customCSS={css`
                    flex-direction: row;
                    gap: 10px;
                  `}
                >
                  <AtomInput
                    value={`${discount}`}
                    onChange={(e) => setDiscount(e.target.value)}
                    type="number"
                    customCSS={css`
                      input {
                        color: #ffffff;
                        background-color: #2e2e35;
                        :focus {
                          background-color: #fe6a6a;
                        }
                        border: none;
                        border-radius: 2px;
                      }
                      height: 18px;
                      width: 50px;
                    `}
                  />
                  %
                </AtomWrapper>
              </AtomText>
              <AtomText width="30%" align="right" maxWidth="30%">
                -${Discount}
              </AtomText>
              <AtomText
                width="70%"
                customCSS={css`
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  gap: 20px;
                `}
              >
                Tax
                <AtomWrapper
                  customCSS={css`
                    flex-direction: row;
                    gap: 10px;
                  `}
                >
                  <AtomInput
                    value={`${tax}`}
                    onChange={(e) => setTax(e.target.value)}
                    type="number"
                    customCSS={css`
                      input {
                        color: #ffffff;
                        background-color: #2e2e35;
                        :focus {
                          background-color: #fe6a6a;
                        }
                        border: none;
                        border-radius: 2px;
                      }
                      height: 18px;
                      width: 50px;
                    `}
                  />
                  %
                </AtomWrapper>
              </AtomText>
              <AtomText width="30%" align="right" maxWidth="30%">
                ${Tax}
              </AtomText>
              <AtomText width="70%">Grand Total</AtomText>
              <AtomText width="30%" align="right">
                ${SubTotal - Discount + Tax}
              </AtomText>
            </AtomWrapper>
            <AtomWrapper
              flexDirection="row"
              customCSS={css`
                gap: 10px 0;
                flex-direction: column;
                justify-content: space-between;
              `}
            >
              {getSeller?.id && (
                <AtomWrapper
                  customCSS={css`
                    padding: 10px 10px;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 15px;
                  `}
                >
                  <AtomImage
                    alt={
                      getSeller?.photo ??
                      'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'
                    }
                    src={
                      getSeller?.photo ??
                      'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'
                    }
                    customCSS={css`
                      width: 50px;
                      height: 50px;
                      border-radius: 50%;
                      object-fit: cover;
                      background-color: #202026;
                    `}
                  />
                  <AtomWrapper
                    customCSS={css`
                      width: max-content;
                      flex-direction: column;
                    `}
                  >
                    <AtomText
                      customCSS={css`
                        font-size: 12px;
                        font-weight: bold;
                        color: #e2e1e2;
                      `}
                    >
                      {`${getSeller?.name ?? 'Seller Name'} ${
                        getSeller?.lastname ?? 'Seller Lastname'
                      }`}
                    </AtomText>
                    <AtomText
                      customCSS={css`
                        font-size: 12px;
                        font-weight: bold;
                        color: #e2e1e2;
                      `}
                    >
                      {`${getSeller?.email ?? 'Seller Email'}`}
                    </AtomText>
                  </AtomWrapper>
                </AtomWrapper>
              )}
              {changeSeller && (
                <AtomInput
                  labelWidth="100%"
                  customCSS={css`
                    select {
                      background-color: #f1576c;
                      color: #ffffff;
                      border: none;
                      height: 31px;
                      font-size: 10px;
                    }
                  `}
                  type="select"
                  value={seller ?? getSeller?.id ?? ''}
                  defaultText="Select a option"
                  onChange={(e) => setSeller(e.target.value)}
                  options={dataUsers?.getUsers?.map((e) => ({
                    id: `${e?.id}`,
                    label: `${e?.name}`,
                    value: `${e?.id}`
                  }))}
                />
              )}
              {['ADMIN', 'OWNER'].includes(user?.role?.name) && (
                <AtomButton
                  width="100%"
                  backgroundColor="#f1576c"
                  fontSize="10px"
                  onClick={() => {
                    setChangeSeller((e) => !e);
                  }}
                >
                  {changeSeller ? 'Cancel' : 'Change Seller'}
                </AtomButton>
              )}
              <AtomButton
                width="100%"
                backgroundColor="#f1576c"
                fontSize="10px"
                onClick={() => setPay(true)}
                disabled={cart.length === 0}
              >
                Pay
              </AtomButton>
            </AtomWrapper>
          </AtomWrapper>
        </AtomWrapper>
      </AtomWrapper>
      <AtomModal
        componentProps={{
          wrapperProps: {
            width: 'max-content',
            height: 'max-content',
            backgroundColor: '#313139'
          }
        }}
        isOpen={modal.modal}
        component={<PageIndex />}
      />
      <AtomModal
        componentProps={{
          wrapperProps: {
            backgroundColor: '#2e2e35',
            height: 'max-content',
            padding: '30px'
          }
        }}
        isOpen={pay}
        component={
          <AtomWrapper>
            {payed ? (
              <>
                {payments === 'CASH' && (
                  <AtomWrapper
                    customCSS={css`
                      max-width: 700px;
                      align-self: center;
                      align-items: center;
                      width: 100%;
                      height: 100%;
                      gap: 20px;
                    `}
                  >
                    <AtomWrapper flexDirection="row" padding="0">
                      <AtomWrapper width="50%">
                        <AtomWrapper
                          maxHeight="300px"
                          justifyContent="flex-start"
                          customCSS={css`
                            gap: 10px;
                            overflow-y: scroll;
                          `}
                        >
                          {cartOnlyBoard.map((e) => (
                            <BOARD {...e} boards={boards} key={e.keyid} />
                          ))}
                          {cartOnlyProduct.map((e) => (
                            <PRODUCT {...e} key={e.keyid} />
                          ))}
                        </AtomWrapper>
                      </AtomWrapper>

                      <AtomWrapper
                        width="50%"
                        height="100%"
                        alignItems="flex-end"
                      >
                        <AtomWrapper
                          flexDirection="row"
                          flexWrap="wrap"
                          customCSS={css`
                            span {
                              font-size: 12px;
                              background-color: #202026;
                              border-radius: 4px;
                              border: 2px solid #2e2e35;
                              color: #ffffff;
                              padding: 8px 15px;

                              text-overflow: ellipsis;
                              overflow: hidden;
                              white-space: nowrap;
                            }
                          `}
                        >
                          <AtomText width="70%">Subtotal</AtomText>
                          <AtomText width="30%" align="right">
                            {`$${SubTotal}`}
                          </AtomText>
                          <AtomText
                            width="70%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Discount
                            <AtomWrapper
                              customCSS={css`
                                flex-direction: row;
                                gap: 10px;
                              `}
                            >
                              <AtomInput
                                value={`${discount}`}
                                onChange={(e) => setDiscount(e.target.value)}
                                type="number"
                                customCSS={css`
                                  input {
                                    color: #ffffff;
                                    background-color: #2e2e35;
                                    :focus {
                                      background-color: #fe6a6a;
                                    }
                                    border: none;
                                    border-radius: 2px;
                                  }
                                  height: 18px;
                                  width: 50px;
                                `}
                              />
                              %
                            </AtomWrapper>
                          </AtomText>
                          <AtomText width="30%" align="right" maxWidth="30%">
                            -${Discount}
                          </AtomText>
                          <AtomText
                            width="70%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Tax
                            <AtomWrapper
                              customCSS={css`
                                flex-direction: row;
                                gap: 10px;
                              `}
                            >
                              <AtomInput
                                value={`${tax}`}
                                onChange={(e) => setTax(e.target.value)}
                                type="number"
                                customCSS={css`
                                  input {
                                    color: #ffffff;
                                    background-color: #2e2e35;
                                    :focus {
                                      background-color: #fe6a6a;
                                    }
                                    border: none;
                                    border-radius: 2px;
                                  }
                                  height: 18px;
                                  width: 50px;
                                `}
                              />
                              %
                            </AtomWrapper>
                          </AtomText>
                          <AtomText width="30%" align="right" maxWidth="30%">
                            ${Tax}
                          </AtomText>
                          <AtomText width="70%">Grand Total</AtomText>
                          <AtomText width="30%" align="right">
                            ${SubTotal - Discount + Tax}
                          </AtomText>
                          <AtomText
                            width="100%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Client payment
                            <AtomInput
                              height="22px"
                              labelWidth="100%"
                              type="number"
                              autoFocus
                              value={`${cash}`}
                              placeholder="$0.00"
                              onChange={(e) => setCash(e.target.value)}
                              customCSS={css`
                                input {
                                  color: #ffffff;
                                  border: none;
                                  border-radius: 2px;
                                  background-color: #2e2e35;
                                  :focus {
                                    background-color: #fe6a6a;
                                  }
                                }
                                height: 18px;
                                width: 100%;
                              `}
                            />
                          </AtomText>

                          <AtomText width="70%">Change</AtomText>
                          <AtomText
                            width="30%"
                            align="right"
                            customCSS={css`
                              color: ${Number(cash) < SubTotal - Discount + Tax
                                ? '#a83240'
                                : '#22b620'} !important;
                            `}
                          >
                            ${Number(cash) - SubTotal - Discount + Tax}
                          </AtomText>
                        </AtomWrapper>
                      </AtomWrapper>
                    </AtomWrapper>
                    <AtomWrapper
                      flexDirection="row"
                      alignItems="flex-end"
                      customCSS={css`
                        gap: 50px;
                      `}
                    >
                      <AtomButton
                        onClick={() => {
                          setPay(!pay);
                          setPayments('');
                          setPayed(false);
                        }}
                      >
                        CANCEL
                      </AtomButton>
                      <AtomButton
                        loading={load2 || load1 || load3}
                        disabled={Number(cash) < SubTotal - Discount + Tax}
                        onClick={() => {
                          EXENEWCOLORSALEORDER({
                            variables: {
                              input: {
                                colors: colors?.map((color) => ({
                                  color: color.id,
                                  quantity: color.count
                                }))
                              }
                            }
                          }).then((e) => {
                            const id = e.data.newColorSaleOrder.id;
                            const cartFilter = cart.filter((item) => item.id);
                            EXENEWSALEORDER({
                              variables: {
                                input: {
                                  store: params.id,
                                  customer: getSeller?.id,
                                  board: cartFilter
                                    ?.filter((e) => e.type === 'BOARD')
                                    .map((e) => ({
                                      board: e?.board?.id,
                                      size: e?.board?.size,
                                      pdf: e?.board?.pdf
                                    })),
                                  typePayment: payments,
                                  sheets: cartFilter
                                    ?.filter((e) => e.type === 'BOARD')
                                    .reduce((acc, item) => {
                                      const board = boards?.getBoards?.find(
                                        (x) => x?.id === item.id
                                      );
                                      const size = board?.sizes?.find(
                                        (x) => x?.id === item.board?.size
                                      );
                                      return (
                                        acc + (size?.x ?? 0) * (size?.y ?? 0)
                                      );
                                    }, 0),
                                  product: cartFilter
                                    ?.filter((e) => e.type === 'PRODUCT')
                                    .map((e) => e?.product?.id),
                                  colorsaleorder: [id],
                                  price: SubTotal - Discount + Tax,
                                  productQuantity: cartFilter
                                    ?.filter((e) => e.type === 'PRODUCT')
                                    .map((e) => ({
                                      id: e?.product?.id,
                                      quantity: e.quantity
                                    }))
                                }
                              }
                            }).then((e) => {
                              LAZYPAYSALEORDERCASH({
                                variables: {
                                  id: e.data.newSaleOrderCash.id
                                }
                              }).then(
                                () =>
                                  (window.location.href = `http://${
                                    location.host
                                  }/dashboard/${
                                    Array.isArray(router?.query?.id)
                                      ? router?.query?.id?.join('/')
                                      : ''
                                  }/ticket/${e.data.newSaleOrderCash.id.toString()}`)
                              );
                            });
                          });
                        }}
                      >
                        PAY
                      </AtomButton>
                    </AtomWrapper>
                  </AtomWrapper>
                )}
                {payments === 'CARD_AMERICAN' && (
                  <AtomWrapper
                    key="card"
                    customCSS={css`
                      max-width: 700px;
                      align-self: center;
                      align-items: center;
                      width: 100%;
                      height: 100%;
                      gap: 20px;
                    `}
                  >
                    <AtomWrapper flexDirection="row" padding="0 30px">
                      <AtomWrapper width="50%">
                        <AtomWrapper
                          maxHeight="300px"
                          justifyContent="flex-start"
                          customCSS={css`
                            gap: 10px;
                            overflow-y: scroll;
                          `}
                        >
                          {cartOnlyBoard.map((e) => (
                            <BOARD key={e.id} {...e} boards={boards} />
                          ))}
                          {cartOnlyProduct.map((e) => (
                            <PRODUCT key={e.id} {...e} />
                          ))}
                        </AtomWrapper>
                      </AtomWrapper>

                      <AtomWrapper
                        width="50%"
                        height="100%"
                        alignItems="flex-end"
                      >
                        <AtomWrapper
                          flexDirection="row"
                          flexWrap="wrap"
                          customCSS={css`
                            span {
                              font-size: 12px;
                              background-color: #202026;
                              border-radius: 4px;
                              border: 2px solid #2e2e35;
                              color: #ffffff;
                              padding: 8px 15px;

                              text-overflow: ellipsis;
                              overflow: hidden;
                              white-space: nowrap;
                            }
                          `}
                        >
                          <AtomText width="70%">Subtotal</AtomText>
                          <AtomText width="30%" align="right">
                            {`$${SubTotal}`}
                          </AtomText>
                          <AtomText
                            width="70%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Discount
                            <AtomWrapper
                              customCSS={css`
                                flex-direction: row;
                                gap: 10px;
                              `}
                            >
                              <AtomInput
                                value={`${discount}`}
                                onChange={(e) => setDiscount(e.target.value)}
                                type="number"
                                customCSS={css`
                                  input {
                                    color: #ffffff;
                                    background-color: #2e2e35;
                                    :focus {
                                      background-color: #fe6a6a;
                                    }
                                    border: none;
                                    border-radius: 2px;
                                  }
                                  height: 18px;
                                  width: 50px;
                                `}
                              />
                              %
                            </AtomWrapper>
                          </AtomText>
                          <AtomText width="30%" align="right" maxWidth="30%">
                            -${Discount}
                          </AtomText>
                          <AtomText
                            width="70%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Tax
                            <AtomWrapper
                              customCSS={css`
                                flex-direction: row;
                                gap: 10px;
                              `}
                            >
                              <AtomInput
                                value={`${tax}`}
                                onChange={(e) => setTax(e.target.value)}
                                type="number"
                                customCSS={css`
                                  input {
                                    color: #ffffff;
                                    background-color: #2e2e35;
                                    :focus {
                                      background-color: #fe6a6a;
                                    }
                                    border: none;
                                    border-radius: 2px;
                                  }
                                  height: 18px;
                                  width: 50px;
                                `}
                              />
                              %
                            </AtomWrapper>
                          </AtomText>
                          <AtomText width="30%" align="right" maxWidth="30%">
                            ${Tax}
                          </AtomText>
                          <AtomText width="70%">Grand Total</AtomText>
                          <AtomText width="30%" align="right">
                            ${SubTotal - Discount + Tax}
                          </AtomText>
                          <AtomText
                            width="100%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Tax Card
                            <AtomInput
                              height="22px"
                              labelWidth="100%"
                              type="number"
                              autoFocus
                              value={`${cardTax}`}
                              placeholder="$0.00"
                              onChange={(e) => setCardTax(e.target.value)}
                              customCSS={css`
                                input {
                                  color: #ffffff;
                                  border: none;
                                  border-radius: 2px;
                                  background-color: #2e2e35;
                                  :focus {
                                    background-color: #fe6a6a;
                                  }
                                }
                                height: 18px;
                                width: 100%;
                              `}
                            />
                          </AtomText>

                          <AtomText width="70%">To Pay</AtomText>
                          <AtomText
                            width="30%"
                            align="right"
                            customCSS={css`
                              color: #22b620 !important;
                            `}
                          >
                            ${SubTotal - Discount + Tax + Number(cardTax)}
                          </AtomText>
                        </AtomWrapper>
                      </AtomWrapper>
                    </AtomWrapper>
                    <AtomWrapper
                      flexDirection="row"
                      alignItems="flex-end"
                      customCSS={css`
                        gap: 50px;
                      `}
                    >
                      <AtomButton
                        onClick={() => {
                          setPay(!pay);
                          setPayments('');
                          setPayed(false);
                        }}
                      >
                        CANCEL
                      </AtomButton>
                      <AtomButton
                        loading={load2 || load1 || load3}
                        onClick={() => {
                          EXENEWCOLORSALEORDER({
                            variables: {
                              input: {
                                colors: colors?.map((color) => ({
                                  color: color.id,
                                  quantity: color.count
                                }))
                              }
                            }
                          }).then((e) => {
                            const id = e.data.newColorSaleOrder.id;
                            EXENEWSALEORDER({
                              variables: {
                                input: {
                                  store: params.id,
                                  customer: seller,
                                  board: cart
                                    ?.filter((e) => e.type === 'BOARD')
                                    .map((e) => ({
                                      board: e?.board?.id,
                                      size: e?.board?.size,
                                      pdf: e?.board?.pdf
                                    })),
                                  typePayment: payments,
                                  sheets: cart
                                    ?.filter((e) => e.type === 'BOARD')
                                    .reduce((acc, item) => {
                                      const board = boards?.getBoards?.find(
                                        (x) => x?.id === item.id
                                      );
                                      const size = board?.sizes?.find(
                                        (x) => x?.id === item.board?.size
                                      );
                                      return (
                                        acc + (size?.x ?? 0) * (size?.y ?? 0)
                                      );
                                    }, 0),
                                  product: cart
                                    ?.filter((e) => e.type === 'PRODUCT')
                                    .map((e) => e?.product?.id),
                                  colorsaleorder: [id],
                                  price:
                                    SubTotal - Discount + Tax + Number(cardTax),
                                  productQuantity: cart
                                    ?.filter((e) => e.type === 'PRODUCT')
                                    .map((e) => ({
                                      id: e?.product?.id,
                                      quantity: e.quantity
                                    }))
                                }
                              }
                            }).then((e) => {
                              LAZYPAYSALEORDERCASH({
                                variables: {
                                  id: e.data.newSaleOrderCash.id
                                }
                              }).then(
                                () =>
                                  (window.location.href = `http://${
                                    location.host
                                  }/dashboard/${
                                    Array.isArray(router?.query?.id)
                                      ? router?.query?.id?.join('/')
                                      : ''
                                  }/ticket/${e.data.newSaleOrderCash.id.toString()}`)
                              );
                            });
                          });
                        }}
                      >
                        PAY
                      </AtomButton>
                    </AtomWrapper>
                  </AtomWrapper>
                )}
                {payments === 'CARD' && (
                  <AtomWrapper
                    key="card"
                    customCSS={css`
                      max-width: 700px;
                      align-self: center;
                      align-items: center;
                      width: 100%;
                      height: 100%;
                      gap: 20px;
                    `}
                  >
                    <AtomWrapper flexDirection="row" padding="0 30px">
                      <AtomWrapper width="50%">
                        <AtomWrapper
                          maxHeight="300px"
                          justifyContent="flex-start"
                          customCSS={css`
                            gap: 10px;
                            overflow-y: scroll;
                          `}
                        >
                          {cartOnlyBoard.map((e) => (
                            <BOARD {...e} boards={boards} key={e.keyid} />
                          ))}
                          {cartOnlyProduct.map((e) => (
                            <PRODUCT {...e} key={e.keyid} />
                          ))}
                        </AtomWrapper>
                      </AtomWrapper>
                      <AtomWrapper
                        width="50%"
                        height="100%"
                        alignItems="flex-end"
                      >
                        <AtomWrapper
                          flexDirection="row"
                          flexWrap="wrap"
                          customCSS={css`
                            span {
                              font-size: 12px;
                              background-color: #202026;
                              border-radius: 4px;
                              border: 2px solid #2e2e35;
                              color: #ffffff;
                              padding: 5px 15px;
                              text-overflow: ellipsis;
                              overflow: hidden;
                              white-space: nowrap;
                            }
                          `}
                        >
                          <AtomText width="70%">Subtotal</AtomText>
                          <AtomText width="30%" align="right">
                            {`$${SubTotal}`}
                          </AtomText>
                          <AtomText
                            width="70%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Discount
                            <AtomWrapper
                              customCSS={css`
                                flex-direction: row;
                                gap: 10px;
                              `}
                            >
                              <AtomInput
                                value={`${discount}`}
                                onChange={(e) => setDiscount(e.target.value)}
                                type="number"
                                customCSS={css`
                                  input {
                                    color: #ffffff;
                                    background-color: #2e2e35;
                                    :focus {
                                      background-color: #fe6a6a;
                                    }
                                    border: none;
                                    border-radius: 2px;
                                  }
                                  height: 18px;
                                  width: 50px;
                                `}
                              />
                              %
                            </AtomWrapper>
                          </AtomText>
                          <AtomText width="30%" align="right" maxWidth="30%">
                            -${Discount}
                          </AtomText>
                          <AtomText
                            width="70%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Tax
                            <AtomWrapper
                              customCSS={css`
                                flex-direction: row;
                                gap: 10px;
                              `}
                            >
                              <AtomInput
                                value={`${tax}`}
                                onChange={(e) => setTax(e.target.value)}
                                type="number"
                                customCSS={css`
                                  input {
                                    color: #ffffff;
                                    background-color: #2e2e35;
                                    :focus {
                                      background-color: #fe6a6a;
                                    }
                                    border: none;
                                    border-radius: 2px;
                                  }
                                  height: 18px;
                                  width: 50px;
                                `}
                              />
                              %
                            </AtomWrapper>
                          </AtomText>
                          <AtomText width="30%" align="right" maxWidth="30%">
                            ${Tax}
                          </AtomText>
                          <AtomText width="70%">Grand Total</AtomText>
                          <AtomText width="30%" align="right">
                            ${SubTotal - Discount + Tax}
                          </AtomText>
                          <AtomText
                            width="100%"
                            customCSS={css`
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              gap: 20px;
                            `}
                          >
                            Tax Card
                            <AtomInput
                              height="22px"
                              labelWidth="100%"
                              type="number"
                              autoFocus
                              value={`${cardTax}`}
                              placeholder="$0.00"
                              onChange={(e) => setCardTax(e.target.value)}
                              customCSS={css`
                                input {
                                  color: #ffffff;
                                  border: none;
                                  border-radius: 2px;
                                  background-color: #2e2e35;
                                  :focus {
                                    background-color: #fe6a6a;
                                  }
                                }
                                height: 18px;
                                width: 100%;
                              `}
                            />
                          </AtomText>

                          <AtomText width="70%">To Pay</AtomText>
                          <AtomText
                            width="30%"
                            align="right"
                            customCSS={css`
                              color: #22b620 !important;
                            `}
                          >
                            ${SubTotal - Discount + Tax + Number(cardTax)}
                          </AtomText>
                        </AtomWrapper>
                      </AtomWrapper>
                    </AtomWrapper>
                    <AtomWrapper
                      flexDirection="row"
                      alignItems="flex-end"
                      customCSS={css`
                        gap: 50px;
                      `}
                    >
                      <AtomButton
                        onClick={() => {
                          setPay(!pay);
                          setPayments('');
                          setPayed(false);
                        }}
                      >
                        CANCEL
                      </AtomButton>
                      <AtomButton
                        loading={load2 || load1 || load3}
                        onClick={() => {
                          EXENEWCOLORSALEORDER({
                            variables: {
                              input: {
                                colors: colors?.map((color) => ({
                                  color: color.id,
                                  quantity: color.count
                                }))
                              }
                            }
                          }).then((e) => {
                            const id = e.data.newColorSaleOrder.id;
                            EXENEWSALEORDER({
                              variables: {
                                input: {
                                  store: params.id,
                                  customer: getSeller?.id,
                                  board: cart
                                    ?.filter((e) => e.type === 'BOARD')
                                    .map((e) => ({
                                      board: e?.board?.id,
                                      size: e?.board?.size,
                                      pdf: e?.board?.pdf
                                    })),
                                  typePayment: payments,
                                  sheets: cart
                                    ?.filter((e) => e.type === 'BOARD')
                                    .reduce((acc, item) => {
                                      const board = boards?.getBoards?.find(
                                        (x) => x?.id === item.id
                                      );
                                      const size = board?.sizes?.find(
                                        (x) => x?.id === item.board?.size
                                      );
                                      return (
                                        acc + (size?.x ?? 0) * (size?.y ?? 0)
                                      );
                                    }, 0),
                                  product: cart
                                    ?.filter((e) => e.type === 'PRODUCT')
                                    .map((e) => e?.product?.id),
                                  colorsaleorder: [id],
                                  price:
                                    SubTotal - Discount + Tax + Number(cardTax),
                                  productQuantity: cart
                                    ?.filter((e) => e.type === 'PRODUCT')
                                    .map((e) => ({
                                      id: e?.product?.id,
                                      quantity: e.quantity
                                    }))
                                }
                              }
                            }).then((e) => {
                              LAZYPAYSALEORDERCASH({
                                variables: {
                                  id: e.data.newSaleOrderCash.id
                                }
                              }).then(
                                () =>
                                  (window.location.href = `http://${
                                    location.host
                                  }/dashboard/${
                                    Array.isArray(router?.query?.id)
                                      ? router?.query?.id?.join('/')
                                      : ''
                                  }/ticket/${e.data.newSaleOrderCash.id.toString()}`)
                              );
                            });
                          });
                        }}
                      >
                        PAY
                      </AtomButton>
                    </AtomWrapper>
                  </AtomWrapper>
                )}
              </>
            ) : (
              <AtomWrapper
                customCSS={css`
                  max-width: 900px;
                  align-items: center;
                  justify-content: center;
                  align-self: center;
                  width: 100%;
                  height: 100%;
                `}
              >
                <AtomWrapper
                  customCSS={css`
                    align-items: center;
                    justify-content: center;
                  `}
                >
                  <AtomText
                    customCSS={css`
                      color: #ffffff;
                      font-size: 20px;
                    `}
                  >
                    Payment Method
                  </AtomText>
                </AtomWrapper>
                <AtomWrapper
                  flexDirection="row"
                  height="max-content"
                  justifyContent="space-between"
                  alignItems="center"
                  customCSS={css`
                    gap: 40px;
                    padding: 40px 0;
                    flex-wrap: wrap;
                  `}
                >
                  {[
                    { id: 1, name: 'American Express', value: 'CARD_AMERICAN' },
                    { id: 2, name: 'Visa/Master Card', value: 'CARD' },
                    { id: 3, name: 'Cash', value: 'CASH' }
                  ].map((e) => (
                    <AtomButton
                      key={e.id}
                      onClick={() => setPayments(e.value)}
                      customCSS={css`
                        height: 250px;
                        flex-basis: 250px;
                        flex-grow: 1;
                        background-color: transparent;
                        border: 1px solid #f1576c;
                        font-size: 18px;
                        font-weight: 500;
                        ${payments === e.value &&
                        css`
                          background-color: #f1576c;
                        `}
                      `}
                    >
                      {e.name}
                    </AtomButton>
                  ))}
                </AtomWrapper>
                <AtomWrapper
                  customCSS={css`
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                  `}
                >
                  <AtomButton
                    backgroundColor="#f1576c"
                    onClick={() => {
                      setPay(!pay);
                      setPayments('');
                    }}
                  >
                    CANCEL
                  </AtomButton>
                  <AtomButton
                    disabled={!payments}
                    backgroundColor="#f1576c"
                    onClick={() => setPayed(true)}
                  >
                    PAY
                  </AtomButton>
                </AtomWrapper>
              </AtomWrapper>
            )}
          </AtomWrapper>
        }
      />
    </DashWithTitle>
  );
};
export default PointSale;

import { useParams } from 'react-router-dom';

type ISheet = {
  quantity: number;
};
const SHEETS = (e: ISheet) => {
  const { quantity } = e;

  return (
    <AtomWrapper
      customCSS={css`
        width: 100%;
        padding: 15px 15px;
        flex-direction: row;
        background-color: #202026;
        border-radius: 4px;
        gap: 20px;
        color: #fff;
        font-weight: bold;
        align-items: center;
      `}
    >
      <AtomImage
        customCSS={css`
          width: 40px;
          height: 40px;
        `}
        src={'/images/board.png'}
        alt={'/images/board.png'}
      />
      <AtomWrapper
        customCSS={css`
          width: calc(100% - 80px);
          display: flex;
          flex-direction: row;
        `}
      >
        <AtomText
          customCSS={css`
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            width: 70%;
          `}
        >
          Boards Units
        </AtomText>
        <AtomWrapper
          customCSS={css`
            display: flex;
            flex-direction: row;
            width: max-content;
            gap: 10px;
            width: 30%;
            justify-content: flex-end;
          `}
        >
          <AtomText color="#ffffff">{quantity}</AtomText>
        </AtomWrapper>
      </AtomWrapper>
    </AtomWrapper>
  );
};

const BOARD = (e: ICart) => {
  const { boards, keyid } = e;
  const setCart = useSetAtom(setCartAtom);
  const board = boards?.getBoards?.find((x) => x?.id === e.id);
  const size = board?.sizes?.find((x) => x?.id === e.board?.size);
  return (
    <AtomWrapper
      key={e.id}
      customCSS={css`
        width: 100%;
        padding: 15px 15px;
        flex-direction: row;
        background-color: #202026;
        border-radius: 4px;
        gap: 20px;
        color: #fff;
        font-weight: bold;
        align-items: center;
      `}
    >
      <AtomImage
        customCSS={css`
          width: 40px;
          height: 40px;
        `}
        src={
          board?.image ?? 'https://images.placeholders.dev/?width=150height=150'
        }
        alt={e.id}
      />
      <AtomWrapper
        customCSS={css`
          width: calc(100% - 80px);
          display: flex;
          flex-direction: row;
        `}
      >
        <AtomText
          customCSS={css`
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            width: 70%;
          `}
        >
          {board?.description} {size?.title}
        </AtomText>
        <AtomWrapper
          customCSS={css`
            display: flex;
            flex-direction: row;
            width: max-content;
            gap: 10px;
            width: 30%;
            justify-content: flex-end;
          `}
        >
          <AtomText color="#ffffff">{e.quantity}</AtomText>

          <AtomButton
            padding="4px"
            onClick={() =>
              setCart({
                key: 'REMOVECART',
                payload: keyid
              })
            }
          >
            <AtomIcon
              width="13px"
              height="13px"
              icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/IXU-0001/icons8-basura.svg"
              color="#ffffff"
            />
          </AtomButton>
        </AtomWrapper>
      </AtomWrapper>
    </AtomWrapper>
  );
};

const PRODUCT = (e: ICart) => {
  const setCart = useSetAtom(setCartAtom);
  const { image, name, color } = e?.product ?? {};
  return (
    <AtomWrapper
      key={e.id}
      customCSS={css`
        width: 100%;
        padding: 15px 15px;
        flex-direction: row;
        background-color: #202026;
        border-radius: 4px;
        gap: 20px;
        color: #fff;
        font-weight: bold;
        align-items: center;
      `}
    >
      <AtomImage
        customCSS={css`
          width: 40px;
          height: 40px;
          background-color: ${color?.color};
          border-radius: 50%;
          padding: 10px;
        `}
        src={image ?? 'https://images.placeholders.dev/?width=150height=150'}
        alt={e.id}
      />

      <AtomWrapper
        customCSS={css`
          width: calc(100% - 80px);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <AtomText
          customCSS={css`
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            width: 30%;
          `}
        >
          {name}
        </AtomText>
        <AtomWrapper
          customCSS={css`
            display: flex;
            flex-direction: row;
            width: max-content;
            gap: 10px;
            width: 70%;
            justify-content: flex-end;
          `}
        >
          <AtomButton
            padding="0px 10px"
            disabled={e.quantity <= 1}
            onClick={() =>
              setCart({
                key: 'REMOVEQUANTITY',
                payload: e.id
              })
            }
          >
            <AtomText color="white">-</AtomText>
          </AtomButton>
          <AtomText color="#ffffff">{e.quantity}</AtomText>
          <AtomButton
            padding="0px 10px"
            onClick={() =>
              setCart({
                key: 'ADDQUANTITY',
                payload: e.id
              })
            }
          >
            <AtomText color="white">+</AtomText>
          </AtomButton>
          <AtomButton
            padding="4px"
            onClick={() =>
              setCart({
                key: 'REMOVECART',
                payload: e.id
              })
            }
          >
            <AtomIcon
              width="13px"
              height="13px"
              icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/IXU-0001/icons8-basura.svg"
              color="white"
            />
          </AtomButton>
        </AtomWrapper>
      </AtomWrapper>
    </AtomWrapper>
  );
};
