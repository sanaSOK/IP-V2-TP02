import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PrimaryGeneratedColumn } from 'typeorm';

@Schema({ timestamps: true })
export class Receipt extends Document {
  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @PrimaryGeneratedColumn("uuid")
  receiptId: string;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);