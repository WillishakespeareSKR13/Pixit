import { useMutation, useQuery } from '@apollo/client';
import { css, SerializedStyles } from '@emotion/react';
import { UPDATEPRODUCTSCOLORS } from '@Src/apollo/client/mutation/color';
import { GETPRODUCTS } from '@Src/apollo/client/query/products';
import DashWithTitle from '@Src/components/layouts/DashWithTitle';
import { TableStyles } from '@Src/styles';

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
  AtomTable,
  AtomWrapper
} from '@sweetsyui/ui';
import { IProducts, IQueryFilter } from 'graphql';
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModalDeleteProduct from './delete';
import ModalNewProduct from './new';
import ModalUpdateProduct from './update';

export type ProductModalType = IProducts & {
  openModal: boolean;
};

const Products: FC = () => {
  const router = useRouter();
  const params = useParams();
  const [itemDelete, setitemDelete] = useState<ProductModalType>({
    openModal: false
  });
  const [itemUpdate, setItemUpdate] = useState<ProductModalType>({
    openModal: false
  });
  const [openNewProduct, setOpenNewProduct] = useState<boolean>(false);
  const { data, refetch } = useQuery<IQueryFilter<'getProducts'>>(GETPRODUCTS, {
    variables: {
      filter: {
        store: params?.id
      }
    }
  });

  const [EXEUPDATEPRODUCTSCOLORS, { loading: loadingUpdateProduct }] =
    useMutation(UPDATEPRODUCTSCOLORS);

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
      title="Create new store type"
      button={
        <AtomWrapper
          customCSS={css`
            flex-direction: row;
            width: max-content;
            gap: 20px;
          `}
        >
          <AtomButton
            loading={loadingUpdateProduct}
            onClick={() => {
              EXEUPDATEPRODUCTSCOLORS({
                variables: {
                  id: params?.id
                }
              }).then(() => {
                refetch();
              });
            }}
          >
            Update Color Products
          </AtomButton>
          <AtomButton onClick={() => setOpenNewProduct(!openNewProduct)}>
            New Product
          </AtomButton>
        </AtomWrapper>
      }
    >
      <ModalDeleteProduct state={itemDelete} setState={setitemDelete} />
      <ModalNewProduct state={openNewProduct} setState={setOpenNewProduct} />
      <ModalUpdateProduct state={itemUpdate} setState={setItemUpdate} />
      <AtomWrapper
        padding="10px 0"
        flexDirection="row"
        customCSS={css`
          min-height: calc(100vh - 140px);
          gap: 30px;
        `}
      >
        <AtomTable
          data={data?.getProducts as IProducts[]}
          customCSS={TableStyles}
          columns={[
            {
              title: '',
              view: (item) => (
                <AtomWrapper flexDirection="row">
                  <AtomButton
                    backgroundColor="transparent"
                    padding="0px 0px"
                    margin="0px 5px 0px 15px"
                    onClick={() => {
                      setItemUpdate({ ...item, openModal: true });
                    }}
                  >
                    <AtomIcon
                      width="20px"
                      height="20px"
                      icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/assets/svgs/JRO-0001/icons/Component%20200%20%E2%80%93%202.svg"
                      customCSS={css`
                        svg {
                          g {
                            path {
                              fill: none !important;
                              stroke: #579af1 !important;
                            }
                          }
                        }
                      `}
                    />
                  </AtomButton>

                  <AtomButton
                    backgroundColor="transparent"
                    padding="0px 0px"
                    margin="0px 5px 0px 15px"
                    onClick={() => {
                      setitemDelete({
                        ...item,
                        openModal: true
                      });
                    }}
                  >
                    <AtomIcon
                      height="20px"
                      width="20px"
                      color="#f1576c"
                      icon="https://storage.googleapis.com/cdn-bucket-ixulabs-platform/MDC-0001/svg/trash-svgrepo-com.svg"
                    />
                  </AtomButton>
                </AtomWrapper>
              ),
              width: '90px',
              customCSS: css`
                padding: 10px 0px !important;
              `
            },
            {
              title: 'image',
              view: (item) => (
                <AtomWrapper
                  customCSS={css`
                    background-color: ${item?.color?.color};
                  `}
                >
                  <AtomImage
                    src={`${item?.image}`}
                    alt={`${item?.image}`}
                    height="70px"
                    width="100%"
                    customCSS={css`
                      overflow: hidden;
                      border-radius: 4px;
                    `}
                  />
                </AtomWrapper>
              )
            },
            {
              title: 'Name',
              view: (item) => <>{`${item?.name}`}</>
            },
            {
              title: 'description',
              view: (item) => <>{`${item?.description}`}</>,
              width: '400px'
            },
            {
              title: 'stock',
              view: (item) => <>{`${item?.stock}`}</>
            },
            {
              title: 'price',
              view: (item) => <>{`${item?.price}`}</>
            }
          ]}
        />
      </AtomWrapper>
    </DashWithTitle>
  );
};
export default Products;
