import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsController } from './notifications.controller';
import { CoreModule } from '../core/core.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ReceiptsModule } from '../receipts/receipts.module';

@Module({
  imports: [
    CoreModule, // ✅ REQUIRED (for EVENT_PUBLISHER)
    TelegramModule, // ✅ For Telegram notifications
    forwardRef(() => OrdersModule),
    forwardRef(() => ReceiptsModule), // ✅ For creating receipts
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}