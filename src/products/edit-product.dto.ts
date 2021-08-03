import {
  IsOptional,
  IsNumber,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { productStatus } from './product-status.enum';

export class EditProductDto {
  @IsOptional()
  @MaxLength(20)
  @MinLength(4)
  title?: string;

  @MaxLength(400)
  @MinLength(4)
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(productStatus)
  status?: productStatus;
}
