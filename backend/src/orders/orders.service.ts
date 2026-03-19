import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../databases/entities/orders.entity';
import { ReceiptsService } from '../receipts/receipts.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly receiptsService: ReceiptsService,
  ) {}

  async findAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async create(dto: { item: string; quantity: number; unitPrice?: number }) {
    const unitPrice = dto.unitPrice ?? 1;
    const order = new this.orderModel({
      item: dto.item,
      quantity: dto.quantity,
      unitPrice,
    });
    const saved = await order.save();

    // create a receipt for this order
    await this.receiptsService.create({
      issuedAt: new Date().toISOString(),
      name: dto.item,
      price: dto.quantity * unitPrice,
    });

    return saved;
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, dto: { item?: string; quantity?: number; unitPrice?: number }) {
    const existing = await this.orderModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Order not found');

    const newQuantity = dto.quantity !== undefined ? dto.quantity : existing.quantity;
    const newUnitPrice = dto.unitPrice !== undefined ? dto.unitPrice : existing.unitPrice ?? 1;

    const updated = await this.orderModel.findByIdAndUpdate(
      id,
      {
        ...(dto.item !== undefined && { item: dto.item }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
      },
      { new: true },
    ).exec();

    // if quantity increased, generate receipt for the additional amount
    const delta = newQuantity - existing.quantity;
    if (delta > 0) {
      await this.receiptsService.create({
        issuedAt: new Date().toISOString(),
        name: dto.item ?? existing.item,
        price: delta * newUnitPrice,
      });
    }

    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }

  async remove(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return { deleted: true, id };
  }
}