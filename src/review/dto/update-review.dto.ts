import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateReviewDto {
    @IsNumber()
    @IsNotEmpty()
    rating?: number;
    
    @IsNotEmpty()
    @IsString()
    comment?: string;
  }
  