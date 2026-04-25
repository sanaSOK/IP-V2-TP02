import { Injectable, NotFoundException, Inject, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../databases/entities/orders.entity';
import { ReceiptsService } from '../receipts/receipts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EVENT_PUBLISHER } from '../core/tokens';


type EventPublisher = {
  publish: (event: string, payload: any) => Promise<void> | void;
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    @Inject(forwardRef(() => ReceiptsService))
    private readonly receiptsService: ReceiptsService,

    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,

    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
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

    // 📱 Send Telegram notification & create receipt
    const orderPayload = {
      id: saved._id.toString(),
      item: saved.item,
      quantity: saved.quantity,
      unitPrice: saved.unitPrice,
    };

    await this.notificationsService.notifyOrderCreated(orderPayload);

    // ✅ clean event payload
    this.safePublish('order_created', orderPayload);

    return saved;
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(
    id: string,
    dto: { item?: string; quantity?: number; unitPrice?: number },
  ) {
    const existing = await this.orderModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Order not found');

    const newQuantity =
      dto.quantity !== undefined ? dto.quantity : existing.quantity;

    const newUnitPrice =
      dto.unitPrice !== undefined ? dto.unitPrice : existing.unitPrice ?? 1;

    const updated = await this.orderModel.findByIdAndUpdate(
      id,
      {
        ...(dto.item !== undefined && { item: dto.item }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
      },
      { new: true },
    ).exec();

    if (!updated) throw new NotFoundException('Order not found');

    // 🧾 generate receipt for additional quantity
    const delta = newQuantity - existing.quantity;
    if (delta > 0) {
      await this.receiptsService.create({
        issuedAt: new Date().toISOString(),
        name: dto.item ?? existing.item,
        price: delta * newUnitPrice,
      });
    }

    // ✅ clean event
    this.safePublish('order_updated', {
      id: updated._id.toString(),
      item: updated.item,
      quantity: updated.quantity,
    });

    return updated;
  }

  async remove(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    this.safePublish('order_deleted', {
      id: order._id.toString(),
    });

    return { deleted: true, id };
  }

  // 🔥 centralized publisher
  private async safePublish(event: string, payload: any) {
    try {
      await this.publisher.publish(event, payload);
    } catch (e) {
      this.logger.warn(`Event publish failed: ${event}`, e);
    }
  }
}