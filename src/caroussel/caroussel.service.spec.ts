import { Test, TestingModule } from '@nestjs/testing';
import { CarousselService } from './caroussel.service';

describe('CarousselService', () => {
  let service: CarousselService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarousselService],
    }).compile();

    service = module.get<CarousselService>(CarousselService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
