import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceiptsModule } from './receipts/receipts.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb+srv://sanasokitc2023_db_user:UMZlZvGWb7uP1lnt@receiptsdb.h1lw9da.mongodb.net/?appName=ReceiptsDB'),
    ReceiptsModule,
    OrdersModule,
    NotificationsModule,
  ],
})
export class AppModule {}