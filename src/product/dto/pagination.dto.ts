import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number) 
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number) 
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
