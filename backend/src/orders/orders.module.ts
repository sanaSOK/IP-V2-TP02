import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from '../databases/entities/orders.entity';
import { ReceiptsModule } from '../receipts/receipts.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), ReceiptsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}