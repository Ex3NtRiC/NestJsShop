import { IsEnum, IsOptional } from 'class-validator';
import { productStatus } from './product-status.enum';

export class FetchProductsFilter {
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsEnum(productStatus)
  status?: productStatus;

  @IsOptional()
  maxPrice?: number;

  @IsOptional()
  minPrice?: number;
}
