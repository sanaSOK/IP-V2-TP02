import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from '../databases/entities/orders.entity';
import { ReceiptsModule } from '../receipts/receipts.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoreModule } from '../core/core.module'; // ✅ IMPORTANT

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),

    CoreModule, // ✅ REQUIRED if using EVENT_PUBLISHER

    forwardRef(() => ReceiptsModule),      // ✅ for receipt creation
    forwardRef(() => NotificationsModule), // ✅ for telegram notifications
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}