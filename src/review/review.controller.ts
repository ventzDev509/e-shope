// review.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Get,
  UseGuards,
  Req,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(
    @Res() res,
    @Req() req,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const userId = req.user.id;
    const response = await this.reviewService.createReview(
      userId,
      createReviewDto,
    );
    res.json(response);
  }

  @Patch(':reviewId')
  async updateReview(
    @Res() res,
    @Req() req,
    @Param('reviewId') reviewId: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const response = await this.reviewService.updateReview(
      reviewId,
      updateReviewDto,
    );
    res.json(response);
  }

  @Delete(':reviewId')
  deleteReview(@Param('reviewId') reviewId: number) {
    return this.reviewService.deleteReview(reviewId);
  }

  @Get('product/:productId')
  async getReviewsByProduct(
    @Res() res,
    @Req() req,
    @Param('productId',ParseIntPipe) productId: number,
  ) {
    const response = await this.reviewService.getReviewsByProduct(productId);
    res.json(response);
  } 
}
