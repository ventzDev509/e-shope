import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    rating: number;

    @IsString()
    @IsNotEmpty()
    comment?: string;
    
    @IsNumber()
    productId: number;
  }
  