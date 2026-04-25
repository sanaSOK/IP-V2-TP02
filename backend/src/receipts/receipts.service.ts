import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt } from '../databases/entities/receipts.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { EVENT_PUBLISHER } from '../core/tokens';

type EventPublisher = {
  publish: (event: string, payload: any) => Promise<void> | void;
};

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<Receipt>,

    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
  ) {}

  async findAll() {
    return this.receiptModel.find().sort({ issuedAt: -1 }).exec();
  }

  async findOne(id: string) {
    const receipt = await this.receiptModel.findById(id).exec();
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async create(dto: CreateReceiptDto) {
    const receipt = new this.receiptModel({
      issuedAt: new Date(dto.issuedAt),
      name: dto.name,
      price: dto.price,
    });

    const saved = await receipt.save();

    // ✅ publish clean + minimal payload
    this.safePublish('receipt_created', {
      id: saved._id.toString(),
      name: saved.name,
      price: saved.price,
      issuedAt: saved.issuedAt,
    });

    return saved;
  }

  async update(id: string, dto: UpdateReceiptDto) {
    const receipt = await this.receiptModel.findByIdAndUpdate(
      id,
      {
        ...(dto.issuedAt !== undefined && { issuedAt: new Date(dto.issuedAt) }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
      },
      { new: true },
    ).exec();

    if (!receipt) throw new NotFoundException('Receipt not found');

    // ✅ send minimal payload
    this.safePublish('receipt_updated', {
      id: receipt._id.toString(),
      name: receipt.name,
      price: receipt.price,
    });

    return receipt;
  }

  async remove(id: string) {
    const receipt = await this.receiptModel.findByIdAndDelete(id).exec();
    if (!receipt) throw new NotFoundException('Receipt not found');

    this.safePublish('receipt_deleted', {
      id: receipt._id.toString(),
    });

    return { deleted: true, id };
  }

  // 🔥 reusable safe publisher
  private async safePublish(event: string, payload: any) {
    try {
      await this.publisher.publish(event, payload);
    } catch (e) {
      this.logger.warn(`Event publish failed: ${event}`, e);
    }
  }
}