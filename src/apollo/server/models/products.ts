import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IProducts extends Document {
  name: string;
  price: number;
  currency: string;
  description: string;
  sku: string;
  stock: number;
  image: string;
  store: ObjectId;
  color: ObjectId;
}

const ProductsSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    description: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true,
      unique: true
    },
    stock: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      default: 'https://images.placeholders.dev/?width=150height=150'
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Color'
    }
  },
  {
    timestamps: true
  }
);

ProductsSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.models.Product ||
  mongoose.model<IProducts>('Product', ProductsSchema);
