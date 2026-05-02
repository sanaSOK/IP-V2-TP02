import { Module } from '@nestjs/common';

import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';

import { CategoryCodeFirstResolver } from './resolvers/category.codefirst.resolver';
import { ProductCodeFirstResolver } from './resolvers/product.codefirst.resolver';

@Module({
  imports: [CategoryModule, ProductModule],

  providers: [
    CategoryCodeFirstResolver,
    ProductCodeFirstResolver,
  ],
})
export class GraphqlModule {}