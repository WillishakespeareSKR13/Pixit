import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ISaleOrder extends Document {
  stripeId: string;
  secret: string;
  number: string;
  product: [ObjectId];
  board: [ObjectId];
  customer: ObjectId;
  store: ObjectId;
  quantity: number;
  sheets: number;
  typePayment: string;
  ticket: string;
  total: number;
  currency: string;
  status: string;
  colorSaleOrder: [ObjectId];
}

const SaleOrderSchema: Schema = new Schema(
  {
    stripeId: { type: String, required: true },
    secret: { type: String, required: true },
    number: { type: String },
    product: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    board: [{ type: Schema.Types.ObjectId, ref: 'BoardSelected' }],
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    store: { type: Schema.Types.ObjectId, ref: 'Store' },
    quantity: {
      type: Number,
      required: true,
      trim: true
    },
    sheets: {
      type: Number,
      required: true,
      trim: true
    },
    typePayment: {
      type: String,
      required: true,
      trim: true
    },
    ticket: { type: String },
    total: {
      type: Number,
      required: true,
      trim: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      default: 'PENDING',
      trim: true
    },

    colorsaleorder: [{ type: Schema.Types.ObjectId, ref: 'ColorSaleOrder' }]
  },
  {
    timestamps: true
  }
);

SaleOrderSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.models.SaleOrder ||
  mongoose.model<ISaleOrder>('SaleOrder', SaleOrderSchema);
