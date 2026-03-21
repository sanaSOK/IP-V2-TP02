import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt } from '../databases/entities/receipts.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiptsService {
  constructor(

    @InjectRepository(Receipt)
    private readonly receiptRepo: Repository<Receipt>,
    private readonly notifications: NotificationsService, // ✅ DI

    @InjectModel(Receipt.name)

    private readonly receiptModel: Model<Receipt>,
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

    const saved = await this.receiptRepo.save(receipt);

    this.notifications.notify('receipt_created', {
      receiptId: saved.receiptId,
      price: saved.price,
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
    return receipt;
  }

  async remove(id: string) {
    const receipt = await this.receiptModel.findByIdAndDelete(id).exec();
    if (!receipt) throw new NotFoundException('Receipt not found');
    return { deleted: true, id };
  }


}