import { Resolvers } from '@apollo/client';
import SaleOrder from '../../models/saleOrder';
import Product from '../../models/products';
import ProductQuantity from '../../models/productsQuantity';
import Board from '../../models/board';
import BoardSize from '../../models/boardSize';
import BoardSelected from '../../models/boardSelected';
import User from '../../models/users';
import Store from '../../models/store';
import StoreType from '../../models/storeTypes';
import ColorSaleOrder from '../../models/colorSaleOrder';
import Stripe from 'stripe';
import * as sgMail from '@sendgrid/mail';
import CONFIG from '../../config';
import { ISaleOrder } from 'graphql';

sgMail.setApiKey(CONFIG.KEY);

const stripe = new Stripe('sk_test_yzlw6HqnbaXA119soMjDkxVz00QguDKKBV', {
  apiVersion: '2020-08-27'
});

const resolvers: Resolvers = {
  Query: {
    getSaleOrders: async (_, { filter, sort, limit }) => {
      const saleOrders = await SaleOrder.find({
        ...filter
      })
        .sort(sort)
        .limit(limit)
        .populate('customer')
        .populate('product')
        .populate({
          path: 'board',
          populate: {
            path: 'board',
            populate: {
              path: 'type'
            }
          }
        })
        .populate({
          path: 'board',
          populate: {
            path: 'size',
            populate: {
              path: 'type'
            }
          }
        })
        .populate('store')
        .populate({
          path: 'colorsaleorder',
          populate: {
            path: 'colors',
            populate: {
              path: 'color'
            }
          }
        });
      if (!saleOrders) throw new Error('No sale orders found');
      return saleOrders;
    },
    getSaleOrderById: async (_, { id }) => {
      const saleOrder = await SaleOrder.findById(id)
        .populate('customer')
        .populate('product')
        .populate({
          path: 'board',
          populate: {
            path: 'board',
            populate: {
              path: 'type'
            }
          }
        })
        .populate({
          path: 'board',
          populate: {
            path: 'size',
            populate: {
              path: 'type'
            }
          }
        })
        .populate('store')
        .populate({
          path: 'colorsaleorder',
          populate: {
            path: 'colors',
            populate: {
              path: 'color'
            }
          }
        });
      if (!saleOrder) throw new Error('No sale order found');

      return saleOrder.toJSON();
    },
    paySaleOrder: async (_, { id }) => {
      const saleOrder = await SaleOrder.findById(id)
        .populate('customer')
        .populate('product')
        .populate({
          path: 'board',
          populate: {
            path: 'board',
            populate: {
              path: 'type'
            }
          }
        })
        .populate({
          path: 'board',
          populate: {
            path: 'size',
            populate: {
              path: 'type'
            }
          }
        })
        .populate('store')
        .populate({
          path: 'colorsaleorder',
          populate: {
            path: 'colors',
            populate: {
              path: 'color'
            }
          }
        });
      if (!saleOrder) throw new Error('No sale order found');
      const paymentRetrieve = await stripe.paymentIntents.retrieve(
        saleOrder.stripeId
      );
      if (!paymentRetrieve) throw new Error('Payment intent not found');
      if (paymentRetrieve.status !== 'succeeded')
        throw new Error('Payment intent not succeeded');

      if (saleOrder.status === 'PAID')
        throw new Error('Sale order already paid');
      saleOrder.status = 'PAID';
      const getStore = await Store.findById(saleOrder.store?._id);
      if (!getStore) throw new Error('Store not found');
      const cash = (getStore.cash ?? 0) + (saleOrder.total ?? 0);
      getStore.cash = cash;
      const sheets = (getStore.sheets ?? 0) - (saleOrder.sheets ?? 0);
      getStore.sheets = sheets;
      getStore.save();
      const GetAllProducts = await ProductQuantity.findOne({
        saleOrder: saleOrder._id
      });
      GetAllProducts.products.forEach(
        async (product: { id: string; quantity: number }) => {
          const productToUpdate = await Product.findById(product.id);
          productToUpdate.stock -= product.quantity;
          await productToUpdate.save();
        }
      );
      saleOrder.save();
      return saleOrder;
    },
    paySaleOrderCash: async (_, { id }) => {
      const saleOrder = await SaleOrder.findById(id)
        .populate('customer')
        .populate('product')
        .populate({
          path: 'board',
          populate: {
            path: 'board',
            populate: {
              path: 'type'
            }
          }
        })
        .populate({
          path: 'board',
          populate: {
            path: 'size',
            populate: {
              path: 'type'
            }
          }
        })
        .populate('store')
        .populate({
          path: 'colorsaleorder',
          populate: {
            path: 'colors',
            populate: {
              path: 'color'
            }
          }
        });
      if (!saleOrder) throw new Error('No sale order found');
      if (saleOrder.status === 'PAID')
        throw new Error('Sale order already paid');
      saleOrder.status = 'PAID';
      const getStore = await Store.findById(saleOrder.store?._id);
      if (!getStore) throw new Error('Store not found');
      const cash = (getStore.cash ?? 0) + (saleOrder.total ?? 0);
      getStore.cash = cash;
      const sheets = (getStore.sheets ?? 0) - (saleOrder.sheets ?? 0);
      getStore.sheets = sheets;
      getStore.save();
      const GetAllProducts = await ProductQuantity.findOne({
        saleOrder: saleOrder._id
      });
      GetAllProducts.products.forEach(
        async (product: { id: string; quantity: number }) => {
          const productToUpdate = await Product.findById(product.id);
          productToUpdate.stock -= product.quantity;
          await productToUpdate.save();
        }
      );
      saleOrder.save();
      return saleOrder;
    }
  },
  Mutation: {
    newSaleOrder: async (_, { input }) => {
      const {
        product,
        board,
        customer,
        store,
        colorsaleorder,
        price,
        sheets,
        typePayment,
        productQuantity
      } = input;

      if (!product && !board) {
        throw new Error('Product or board is required');
      }

      const productExist = async () => {
        if (!product) {
          return null;
        }
        const products = product.map(async (e: string) => {
          if (e) {
            const findProduct = await Product.findById(e);
            if (!findProduct) throw new Error('Product not found');
            return findProduct;
          }
        });
        return (await Promise.all(products)).filter(
          (e) => typeof e !== 'undefined'
        );
      };

      const boardExist = async () => {
        if (!board) {
          return null;
        }
        const boards = board.map(
          async (e: { board: string; size: string; pdf: string }) => {
            if ((e.board && e.size, e.pdf)) {
              const findBoard = await Board.findById(e.board);
              const findBoardSize = await BoardSize.findById(e.size);
              if (!findBoard) throw new Error('Board not found');
              if (!findBoardSize) throw new Error('Board size not found');

              const createBoardSelected = await BoardSelected.create({
                board: findBoard,
                size: findBoardSize,
                pdf: e.pdf
              });

              const getBoardSelected = await BoardSelected.findById(
                createBoardSelected.id
              )
                .populate('board')
                .populate('size');

              if (!getBoardSelected)
                throw new Error('Board selected not found');

              return getBoardSelected;
            }
          }
        );
        return (await Promise.all(boards)).filter(
          (e) => typeof e !== 'undefined'
        );
      };

      const quantityExist = () => {
        const productQuantity = () => {
          return getProduct?.length ?? 0;
        };
        const boardQuantity = () => {
          return getBoard?.length ?? 0;
        };
        return productQuantity() + boardQuantity();
      };

      const currencyExist = () => {
        const productCurrency = () => {
          return getProduct?.reduce((a, b) => [...a, b.currency], []) ?? [];
        };
        const boardCurrency = () => {
          return getBoard?.reduce((a, b) => [...a, b.board.currency], []) ?? [];
        };
        const currency = [
          ...new Set([...productCurrency(), ...boardCurrency()])
        ];
        if (currency.length > 1) throw new Error('Currency not match');
        return currency[0] ?? 'USD';
      };

      const colorSaleOrderExist = async () => {
        if (!colorsaleorder) {
          return {};
        }
        const getColorSaleOrder = await ColorSaleOrder.findById(colorsaleorder);
        if (!getColorSaleOrder) throw new Error('Color sale order not found');
        return {
          colorsaleorder: getColorSaleOrder._id
        };
      };

      const getProduct = await productExist();
      const getBoard = await boardExist();
      const getQuantity = quantityExist();
      const getCurrency = currencyExist();
      const getColorSaleOrder = await colorSaleOrderExist();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price) * 100,
        currency: getCurrency,
        payment_method_types: ['card']
      });

      if (!paymentIntent) throw new Error('Payment intent not found');

      const customerExist = async () => {
        if (!customer) {
          return {};
        }
        const customerExist = await User.findById(customer).populate('role');
        if (!customerExist) throw new Error('Customer does not exist');
        if (!['AGENT', 'OWNER', 'ADMIN'].includes(customerExist.role.name))
          throw new Error('Customer is not an agent');
        return { customer: customerExist._id };
      };
      const storeTypeExist = async () => {
        if (!store) {
          const typeExist = await StoreType.findOne({ name: 'WEBSITE' });
          if (!typeExist)
            throw new Error('First create a StoreType named WEBSITE');

          const storeExist = await Store.findOne({ storeType: typeExist.id });
          if (!storeExist) throw new Error('First create a Store');

          return storeExist;
        }
        const storeExist = await Store.findById(store);

        return storeExist;
      };

      const customerGet = await customerExist();
      const storeGet = await storeTypeExist();
      const getAllSaleOrders = await SaleOrder.find({ store: storeGet._id });
      const saleOrder = await SaleOrder.create({
        stripeId: paymentIntent.id,
        secret: paymentIntent.client_secret,
        number: getAllSaleOrders.length + 1,
        product: getProduct?.map((e) => e._id),
        board: getBoard?.map((e) => e._id),
        sheets,
        typePayment,
        ...customerGet,
        ...getColorSaleOrder,
        store: storeGet._id,
        quantity: getQuantity,
        total: price,
        currency: getCurrency
      });
      if (!saleOrder) throw new Error('Error creating sale order');
      await ProductQuantity.create({
        saleOrder: saleOrder._id,
        products: productQuantity
      });
      const getSaleOrder = await SaleOrder.findById(saleOrder._id)
        .populate('customer')
        .populate('product')
        .populate({
          path: 'board',
          populate: {
            path: 'board',
            populate: {
              path: 'type'
            }
          }
        })
        .populate({
          path: 'board',
          populate: {
            path: 'size',
            populate: {
              path: 'type'
            }
          }
        })
        .populate('store')
        .populate({
          path: 'colorsaleorder',
          populate: {
            path: 'colors.color'
          }
        });

      return getSaleOrder;
    },
    newSaleOrderCash: async (_, { input }) => {
      const {
        product,
        board,
        customer,
        store,
        colorsaleorder,
        price,
        sheets,
        typePayment,
        productQuantity
      } = input;

      if (!product && !board) {
        throw new Error('Product or board is required');
      }

      const productExist = async () => {
        if (!product) {
          return null;
        }
        const products = product.map(async (e: string) => {
          if (e) {
            const findProduct = await Product.findById(e);
            if (!findProduct) throw new Error('Product not found');
            return findProduct;
          }
        });
        return (await Promise.all(products)).filter(
          (e) => typeof e !== 'undefined'
        );
      };

      const boardExist = async () => {
        if (!board) {
          return null;
        }
        const boards = board.map(
          async (e: { board: string; size: string; pdf: string }) => {
            if ((e.board && e.size, e.pdf)) {
              const findBoard = await Board.findById(e.board);
              const findBoardSize = await BoardSize.findById(e.size);
              if (!findBoard) throw new Error('Board not found');
              if (!findBoardSize) throw new Error('Board size not found');

              const createBoardSelected = await BoardSelected.create({
                board: findBoard,
                size: findBoardSize,
                pdf: e.pdf
              });

              const getBoardSelected = await BoardSelected.findById(
                createBoardSelected.id
              )
                .populate('board')
                .populate('size');

              if (!getBoardSelected)
                throw new Error('Board selected not found');

              return getBoardSelected;
            }
          }
        );
        return (await Promise.all(boards)).filter(
          (e) => typeof e !== 'undefined'
        );
      };

      const quantityExist = () => {
        const productQuantity = () => {
          return getProduct?.length ?? 0;
        };
        const boardQuantity = () => {
          return getBoard?.length ?? 0;
        };
        return productQuantity() + boardQuantity();
      };

      const currencyExist = () => {
        const productCurrency = () => {
          return getProduct?.reduce((a, b) => [...a, b.currency], []) ?? [];
        };
        const boardCurrency = () => {
          return getBoard?.reduce((a, b) => [...a, b.board.currency], []) ?? [];
        };
        const currency = [
          ...new Set([...productCurrency(), ...boardCurrency()])
        ];
        if (currency.length > 1) throw new Error('Currency not match');
        return currency[0] ?? 'USD';
      };

      const colorSaleOrderExist = async () => {
        if (!colorsaleorder) {
          return {};
        }
        const getColorSaleOrder = await ColorSaleOrder.findById(colorsaleorder);
        if (!getColorSaleOrder) throw new Error('Color sale order not found');
        return {
          colorsaleorder: getColorSaleOrder._id
        };
      };

      const getProduct = await productExist();
      const getBoard = await boardExist();
      const getQuantity = quantityExist();
      const getCurrency = currencyExist();
      const getColorSaleOrder = await colorSaleOrderExist();

      const customerExist = async () => {
        if (!customer) {
          return {};
        }
        const customerExist = await User.findById(customer).populate('role');
        if (!customerExist) throw new Error('Customer does not exist');
        if (!['AGENT', 'OWNER', 'ADMIN'].includes(customerExist.role.name))
          throw new Error('Customer is not an agent');
        return { customer: customerExist._id };
      };
      const storeTypeExist = async () => {
        if (!store) {
          const typeExist = await StoreType.findOne({ name: 'WEBSITE' });
          if (!typeExist)
            throw new Error('First create a StoreType named WEBSITE');

          const storeExist = await Store.findOne({ storeType: typeExist.id });
          if (!storeExist) throw new Error('First create a Store');

          return storeExist;
        }
        const storeExist = await Store.findById(store);

        return storeExist;
      };

      const customerGet = await customerExist();
      const storeGet = await storeTypeExist();

      const getAllSaleOrders = await SaleOrder.find({ store: storeGet._id });

      const saleOrder = await SaleOrder.create({
        stripeId: 'CASH',
        secret: 'CASH',
        number: getAllSaleOrders.length + 1,
        product: getProduct?.map((e) => e._id),
        board: getBoard?.map((e) => e._id),
        sheets,
        typePayment,
        ...customerGet,
        ...getColorSaleOrder,
        store: storeGet._id,
        quantity: getQuantity,
        total: price,
        currency: getCurrency
      });
      if (!saleOrder) throw new Error('Error creating sale order');
      await ProductQuantity.create({
        saleOrder: saleOrder._id,
        products: productQuantity
      });
      const getSaleOrder = await SaleOrder.findById(saleOrder._id)
        .populate('customer')
        .populate('product')
        .populate({
          path: 'board',
          populate: {
            path: 'board',
            populate: {
              path: 'type'
            }
          }
        })
        .populate({
          path: 'board',
          populate: {
            path: 'size',
            populate: {
              path: 'type'
            }
          }
        })
        .populate('store')
        .populate({
          path: 'colorsaleorder',
          populate: {
            path: 'colors.color'
          }
        });

      return getSaleOrder;
    },
    sendMailSaleOrder: async (_, { id, email }) => {
      const saleOrder = (await SaleOrder.findById(id)
        .populate('customer')
        .populate('product')
        .populate({
          path: 'board',
          populate: {
            path: 'board',
            populate: {
              path: 'type'
            }
          }
        })
        .populate({
          path: 'board',
          populate: {
            path: 'size',
            populate: {
              path: 'type'
            }
          }
        })
        .populate('store')
        .populate({
          path: 'colorsaleorder',
          populate: {
            path: 'colors.color'
          }
        })) as ISaleOrder;

      if (!saleOrder) throw new Error('Sale order not found');

      const html = `
      ${saleOrder.board
        ?.map(
          (e) => `
      <a href="${e?.pdf}" target="_blank">
        PDF: ${e?.board?.type?.name} ${e?.board?.title} ${e?.size?.type?.name} 
      </a>
      `
        )
        .join('<br/>')}
        <br/>
        <a href="${saleOrder?.ticket}" target="_blank">
          TICKET
        </a>
        
      `;

      const msg = {
        to: email,
        from: 'pixit@willskr.me',
        subject: `Pixit - Sale Order #${saleOrder?.id}`,
        text: 'Thank you for your purchase',
        html: html
      };
      const SendPromise = new Promise((resolve, reject) => {
        sgMail
          .send(msg)
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      });

      const send = await SendPromise;
      if (!send) throw new Error('Error sending email');

      return {
        message: 'Email sent'
      };
    },
    updateSaleOrder: async (_, { id, input }) => {
      const saleOrder = await SaleOrder.findById(id);
      if (!saleOrder) throw new Error('Sale order not found');

      const updateSaleOrder = await SaleOrder.findByIdAndUpdate(id, input, {
        new: true
      });
      if (!updateSaleOrder) throw new Error('Error updating sale order');

      return updateSaleOrder;
    }
  }
};

export default resolvers;
