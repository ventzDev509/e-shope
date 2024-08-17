import { IsInt, IsOptional } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  @IsInt()
  quantity?: number;
}
