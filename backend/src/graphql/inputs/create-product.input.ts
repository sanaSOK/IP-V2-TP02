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
  MaxLength,
  IsPositive,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(100, { message: 'Product name must be 100 characters or less' })
  name: string;

  @Field(() => Float)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  // ✅ use Int instead of ID
  @Field(() => Int)
  @IsNumber()
  @IsPositive({ message: 'CategoryId must be a positive number' })
  categoryId: number;
}