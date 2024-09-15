import { 
    IsNotEmpty, 
    IsNumber, 
    IsString, 
    IsOptional, 
    IsArray, 
    ValidateNested, 
    IsDate 
  } from 'class-validator';
  import { Type } from 'class-transformer';
export class UpdateOrder {
    @IsOptional()
    @IsString()
    status?: string; // Par exemple: 'PENDING', 'COMPLETED', 'CANCELLED'
  
  }