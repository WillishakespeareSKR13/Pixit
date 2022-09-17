import { Resolvers } from '@apollo/client';
import Products from '../../models/products';
import Colors from '../../models/colors';
import Store from '../../models/store';
import { v4 } from 'uuid';

const resolvers: Resolvers = {
  Query: {
    getProducts: async (_, { filter }) => {
      const { storeArray } = filter;
      const store = storeArray ? { store: { $in: storeArray } } : {};
      return await Products.find({
        ...filter,
        ...store
      })
        .populate({
          path: 'store',
          populate: {
            path: 'storeType'
          }
        })
        .populate({
          path: 'color'
        });
    },
    getProductById: async (_, { id }) => {
      return await Products.findById(id)
        .populate({
          path: 'store',
          populate: {
            path: 'storeType'
          }
        })
        .populate({
          path: 'color'
        });
    }
  },
  Mutation: {
    newProduct: async (_, { input }) => {
      const { store } = input;
      const storeExist = await Store.findById(store).populate({
        path: 'storeType'
      });

      if (!storeExist) throw new Error('Store does not exist');

      const product = await Products.create({
        ...input,
        store: storeExist.id
      });
      return {
        ...product.toJSON(),
        store: storeExist
      };
    },
    updateProduct: async (_, { id, input }) => {
      const productExist = await Products.findById(id);
      if (!productExist) throw new Error('Product does not exist');

      const product = await Products.findByIdAndUpdate(id, input, {
        new: true
      });
      return product;
    },
    deleteProduct: async (_, { id }) => {
      const productExist = await Products.findById(id);
      if (!productExist) throw new Error('Product does not exist');

      const product = await Products.findByIdAndDelete(id);
      return product;
    },
    generateProductsColors: async (_, { input }) => {
      const { price, stock, store } = input;

      const storeExist = await Store.findById(store).populate({
        path: 'storeType'
      });
      if (!storeExist) throw new Error('Store does not exist');

      const getColors = await Colors.find({});
      const colors = getColors.map(
        async (color) =>
          await Products.create({
            ...input,
            store: storeExist.id,
            name: color?.name,
            description: color?.name,
            sku: `${color?.name}_${v4()}`,
            image: color?.icon,
            color: color?.id,
            price: price,
            stock: stock
          })
      );
      return await Promise.all(colors);
    },
    updateProductsColors: async (_, { id }) => {
      const storeExist = await Store.findById(id).populate({
        path: 'storeType'
      });
      if (!storeExist) throw new Error('Store does not exist');
      const productsByStore = await Products.find({ store: storeExist.id });
      const getColors = await Colors.find({});
      const products = productsByStore.reduce((acc, product) => {
        const color = getColors.find(
          (color) => color.id === product.color?.toJSON()
        );
        return color
          ? [
              ...acc,
              {
                new: color,
                old: product
              }
            ]
          : acc;
      }, []);

      const productsNotCreated = getColors.filter(
        (color) =>
          !productsByStore.find(
            (product) => product.color?.toJSON() === color.id
          )
      );
      const newColors = productsNotCreated.map(
        async (color) =>
          await Products.create({
            store: storeExist.id,
            name: color?.name,
            description: color?.name,
            sku: `${color?.name}_${v4()}`,
            image: color?.icon,
            color: color?.id,
            price: 5,
            stock: 1000
          })
      );

      const updateProducts = products.map(
        async (product: {
          old: { id: string };
          new: { name: string; icon: string };
        }) =>
          await Products.findByIdAndUpdate(product.old.id, {
            name: product.new.name,
            description: product.new.name,
            image: product.new.icon
          })
      );
      return await Promise.all([...updateProducts, ...newColors]);
    }
  }
};

export default resolvers;
