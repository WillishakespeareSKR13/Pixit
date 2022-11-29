/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  usePDF,
  View
} from '@react-pdf/renderer';
import { useQuery } from '@apollo/client';
import { IQueryFilter, ISaleOrder } from 'graphql';
import { GETSALEORDERBYID } from '@Src/apollo/client/query/saleOrder';
import { GETPRODUCTQUANTITY } from '@Src/apollo/client/query/products';
import { useMemo, useState, useEffect } from 'react';
import { GETTERMSCONDITIONS } from '@Src/apollo/client/query/termsconditions';

type Props = {
  id?: string;
  store?: any;
  qrs?: string[];
  callback?: () => void;
};

const NewDocument = Document as any;
const NewPage = Page as any;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 10,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    alignItems: 'center'
  },
  logo: {
    height: '40px',
    width: '100px',
    marginBottom: 20
  },
  text: {
    fontSize: 6,
    marginBottom: 5,
    maxWidth: 250
  },
  text2: {
    fontSize: 6,
    marginBottom: 2,
    maxWidth: 250
  },
  text3: {
    fontSize: 6,
    marginBottom: 2,
    width: '100%'
  },
  textLarge: {
    fontSize: 6,
    marginBottom: 2,
    width: 80
  },
  textEnd: {
    fontSize: 6,
    marginBottom: 2,
    width: 60
  },
  textBig: {
    fontSize: 6,
    marginBottom: 2,
    fontWeight: 'bold'
  },
  viewJustify: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

type PropsPDF = {
  id?: string;
  product?: ISaleOrder;
  products?: {
    id: string;
    quantity: number;
  }[];
  store?: any;
  terms?: any;
  qrs?: string[];
};

export const PDF = (props: PropsPDF) => {
  const { product, products, store, terms, qrs } = props;
  const getProduct = useMemo(
    () =>
      product?.product?.map((product) => ({
        product: product,
        quantity:
          products?.find(
            (productQuantity) => productQuantity.id === product?.id
          )?.quantity ?? 0
      })) ?? [],
    [product, products]
  );
  return (
    <NewDocument>
      <NewPage size={'A4'} style={styles.page}>
        <Image style={styles.logo} src="/images/logo.png" />
        <View
          style={{
            flexDirection: 'row'
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              width: '60%'
            }}
          >
            <View style={styles.viewJustify}>
              <Text style={styles.text}>01/12/22</Text>
              <Text style={styles.text}>
                No.{' '}
                {`${addcero(store?.numberoffice)}${addcero(
                  store?.numberstore
                )}${addcero(Number(product?.number ?? 1))}`}
              </Text>
            </View>
            <View style={styles.viewJustify}>
              <View
                style={{
                  width: '250px'
                }}
              >
                <Text style={styles.text2}>{store?.name}</Text>
                <Text
                  style={styles.text2}
                >{`${store?.street} ${store?.zip}`}</Text>
                <Text style={styles.text2}>{store?.id}</Text>
                <Text style={styles.text2}>{`No. Ticket ${addcero(
                  Number(product?.number ?? 1)
                )}`}</Text>
              </View>
              <View
                style={{
                  width: '100%'
                }}
              />
            </View>
            <Text style={styles.textBig}>Sales</Text>
            <View style={{ ...styles.viewJustify, paddingTop: 10 }}>
              <Text style={styles.textLarge}>Boards</Text>
              <Text style={styles.text}>Quantity</Text>
              <Text style={styles.textEnd}>Price</Text>
            </View>
            {product?.board?.map((board) => (
              <View style={styles.viewJustify} key={board?.id}>
                <Text style={styles.textLarge}>
                  {board?.board?.title} / {board?.size?.title}
                </Text>
                <Text style={styles.text}>1</Text>
                <Text style={styles.textEnd}>${board?.size?.price}</Text>
              </View>
            ))}
            <View style={{ ...styles.viewJustify, paddingTop: 10 }}>
              <Text style={styles.textLarge}>Boards Units</Text>
              <Text style={styles.text}>Quantity</Text>
              <Text style={styles.textEnd}>Price</Text>
            </View>
            <View style={styles.viewJustify}>
              <Text style={styles.textLarge}>Unit</Text>
              <Text style={styles.text}>{product?.sheets ?? 0}</Text>
              <Text style={styles.textEnd}>${store?.sheetPrice ?? 0}</Text>
            </View>
            <View style={{ ...styles.viewJustify, paddingTop: 10 }}>
              <Text style={styles.textLarge}>Products</Text>
              <Text style={styles.text}>Quantity</Text>
              <Text style={styles.textEnd}>Price</Text>
            </View>
            {getProduct?.map((product) => (
              <View style={styles.viewJustify} key={product.product?.id}>
                <Text style={styles.textLarge}>{product.product?.name}</Text>
                <Text style={styles.text}>{product.quantity}</Text>
                <Text style={styles.textEnd}>{''}</Text>
              </View>
            ))}
            <View style={styles.viewJustify}>
              <Text style={styles.textLarge}></Text>
              <Text style={styles.text}>Total</Text>
              <Text style={styles.textEnd}>
                $
                {product?.board?.reduce(
                  (acc, value) => acc + (value?.size?.price ?? 0),
                  0
                ) ?? 0}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              width: '40%'
            }}
          >
            <View
              style={{
                flexDirection: 'column',
                width: '100%'
              }}
            >
              <Text style={styles.text3}>Terms and Conditions</Text>
              <Text style={styles.text3}>{terms?.conditions}</Text>
              <Text style={styles.text3}>Terminos y Condiciones</Text>
              <Text style={styles.text3}>{terms?.terms}</Text>
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: '20px'
              }}
            >
              {qrs?.map((qr) => (
                <Image
                  source={qr}
                  key={qr}
                  style={{
                    width: 80,
                    height: 80
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </NewPage>
    </NewDocument>
  );
};

const DownloadTicket = (props: Props) => {
  const { id, store, qrs } = props;
  const [isLoad, setIsLoad] = useState(true);
  const { data } = useQuery<IQueryFilter<'getSaleOrderById'>>(
    GETSALEORDERBYID,
    {
      variables: {
        id: id
      }
    }
  );

  const { data: dataproduct } = useQuery(GETPRODUCTQUANTITY, {
    variables: {
      id: id
    }
  });
  const { data: dataterm } = useQuery(GETTERMSCONDITIONS);

  const [pdf, update] = usePDF({
    document: (
      <PDF
        id={id}
        store={store}
        qrs={qrs}
        product={data?.getSaleOrderById}
        products={dataproduct?.getProductQuantityBySaleOrder?.products}
        terms={dataterm?.getTermsConditions}
      />
    )
  });

  useEffect(() => {
    const load =
      id &&
      store &&
      dataproduct &&
      data &&
      dataterm?.getTermsConditions &&
      ((data?.getSaleOrderById?.board?.length ?? 0) > 0
        ? (qrs?.length ?? 0) > 0
        : true);
    if (load) {
      update();
      setIsLoad(false);
    }
  }, [dataproduct, data, dataterm, qrs, store, id]);

  if (!isLoad && !pdf?.loading) {
    return pdf;
  }
  return null;
};

export default DownloadTicket;

const addcero = (num: number) => {
  return (
    Array.from({ length: 5 - num?.toString().length }, () => '0').join('') + num
  );
};
