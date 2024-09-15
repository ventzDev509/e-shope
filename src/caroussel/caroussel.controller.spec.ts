import { Test, TestingModule } from '@nestjs/testing';
import { CarousselController } from './caroussel.controller';

describe('CarousselController', () => {
  let controller: CarousselController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarousselController],
    }).compile();

    controller = module.get<CarousselController>(CarousselController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
