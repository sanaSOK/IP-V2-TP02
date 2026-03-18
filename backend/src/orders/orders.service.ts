import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../databases/entities/orders.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  async findAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async create(dto: { item: string; quantity: number }) {
    const order = new this.orderModel({
      item: dto.item,
      quantity: dto.quantity,
    });
    return order.save();
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, dto: { item?: string; quantity?: number }) {
    const updated = await this.orderModel.findByIdAndUpdate(
      id,
      {
        ...(dto.item !== undefined && { item: dto.item }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
      },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }

  async remove(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return { deleted: true, id };
  }
}