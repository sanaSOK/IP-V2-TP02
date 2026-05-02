import {
  InputType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  price: number;

  // ✅ use Int instead of ID
  @Field(() => Int)
  @IsNumber()
  categoryId: number;
}