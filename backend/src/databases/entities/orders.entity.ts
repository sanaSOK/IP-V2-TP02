import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  item: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: false, default: 1 })
  unitPrice: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
