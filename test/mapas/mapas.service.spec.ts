import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Point } from '../../src/mapas/entities/point.schema';
import { MapasService } from '../../src/mapas/mapas.service';

describe('MapasService', () => {
  let service: MapasService;

  function mockPointModel(dto: any) {
    this.data = dto;
    this.save = () => {
      this.data.id = '123';
      return this.data;
    };
  }

  const dynamicModule = (fn: any) => {
    return Test.createTestingModule({
      providers: [
        MapasService,
        {
          provide: getModelToken(Point.name),
          useValue: fn,
        },
      ],
    }).compile();
  };

  it('should create point with sucess', async () => {
    const module = await dynamicModule(mockPointModel);
    service = module.get<MapasService>(MapasService);

    expect(
      await service.create({
        title: 'teste',
        description: 'teste',
        latitude: 0,
        longitude: 0,
      }),
    ).toBe('123');
  });
});
