// review.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: number, createReviewDto: CreateReviewDto) {
    const { rating, comment, productId } = createReviewDto;

    // Vérifier si le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Créer le review
    return await this.prisma.review.create({
      data: {
        rating,
        comment,
        product: { connect: { id: productId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async updateReview(reviewId: number, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Mettre à jour l'avis
    return await this.prisma.review.update({
      where: { id: reviewId },
      data: { ...updateReviewDto },
    });
  }

  async deleteReview(reviewId: number) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Supprimer l'avis
    return await this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

//   async getReviewsByProduct(productId: number) {
//     return await this.prisma.review.findMany({
//       where: { productId },
//       include: { user: true }, 
//     });
//   }
  async getReviewsByProduct(productId: number, limit: number = 4, page: number = 1) {
    return await this.prisma.review.findMany({
      where: { productId },
      take: limit, // Limite le nombre d'avis par requête
    //   skip: (page - 1) * limit, // Pagination : saute les avis des pages précédentes
      include: { user: true },
    });
  }
  
}
