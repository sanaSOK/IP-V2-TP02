import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
