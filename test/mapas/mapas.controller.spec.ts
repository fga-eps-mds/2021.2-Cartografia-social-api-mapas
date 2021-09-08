import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Point } from '../../src/mapas/entities/point.schema';
import { MapasController } from '../../src/mapas/mapas.controller';
import { MapasService } from '../../src/mapas/mapas.service';

describe('MapasController', () => {
  let controller: MapasController;

  const dynamicModule = (fn: any) => {
    return Test.createTestingModule({
      controllers: [MapasController],
      providers: [
        MapasService,
        {
          provide: getModelToken(Point.name),
          useValue: fn,
        },
      ],
    }).compile();
  };

  beforeEach(async () => {
    const module: TestingModule = await dynamicModule(jest.fn());

    controller = module.get<MapasController>(MapasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
