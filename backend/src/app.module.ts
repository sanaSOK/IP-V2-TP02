import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ReceiptsModule } from './receipts/receipts.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CoreModule } from './core/core.module';
import { GraphqlModule } from './graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb+srv://sanasokitc2023_db_user:UMZlZvGWb7uP1lnt@receiptsdb.h1lw9da.mongodb.net/?appName=ReceiptsDB'),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,

      // SCHEMA-FIRST
      // typePaths: [join(process.cwd(), 'src/graphql/schema/*.graphql')],
      // CODE-FIRST
      autoSchemaFile: join(
      process.cwd(),
      'src/graphql/schema.gql',
    ),

      playground: true,
    }),
    ReceiptsModule,
    OrdersModule,
    NotificationsModule,
    CoreModule,
    GraphqlModule
  ],
})
export class AppModule {}