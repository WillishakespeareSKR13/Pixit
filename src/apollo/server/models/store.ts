import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IStore extends Document {
  name: string;
  numberoffice: number;
  numberstore: number;
  description: string;
  phone: string;
  email: string;
  website: string;
  photo: string;
  street: string;
  cash: number;
  sheets: number;
  sheetPrice: number;
  currency: string;
  convertion: number;
  city: string;
  state: string;
  zip: string;
  storeType: ObjectId;
}

const StoreSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    numberoffice: {
      type: Number
    },
    numberstore: {
      type: Number
    },
    description: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    convertion: {
      type: Number,
      trim: true,
      default: 21
    },
    photo: {
      type: String,
      trim: true,
      default:
        'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'
    },
    street: {
      type: String,
      trim: true
    },
    cash: {
      type: Number,
      trim: true,
      default: 0.0
    },
    sheets: {
      type: Number,
      default: 0
    },
    sheetPrice: {
      type: Number,
      default: 0.0
    },
    currency: {
      type: String,
      trim: true,
      default: 'USD'
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zip: {
      type: String,
      trim: true
    },
    storeType: {
      type: Schema.Types.ObjectId,
      ref: 'StoreType'
    }
  },
  {
    timestamps: true
  }
);

StoreSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.models.Store ||
  mongoose.model<IStore>('Store', StoreSchema);
