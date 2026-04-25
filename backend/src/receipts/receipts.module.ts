import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { Receipt, ReceiptSchema } from '../databases/entities/receipts.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoreModule } from '../core/core.module'; // ✅ ADD THIS

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Receipt.name, schema: ReceiptSchema },
    ]),
    CoreModule, // ✅ REQUIRED for EVENT_PUBLISHER
    NotificationsModule, // optional (only if you use it)
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}