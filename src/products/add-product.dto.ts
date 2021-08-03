import { IsNotEmpty, IsNumber, MaxLength, MinLength } from 'class-validator';

export class AddProductDto {
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(4)
  title!: string;

  @MaxLength(400)
  @MinLength(4)
  @IsNotEmpty()
  description!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;
}
