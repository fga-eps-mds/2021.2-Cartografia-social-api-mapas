import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MediaRelation } from '../../src/mapas/entities/mediaRelation.schema';
import { Area } from '../../src/mapas/entities/area.schema';
import { Point } from '../../src/mapas/entities/point.schema';
import { MapasController } from '../../src/mapas/mapas.controller';
import { MapasService } from '../../src/mapas/mapas.service';

describe('MapasController', () => {
  let controller: MapasController;
  const id = { id: '123' };

  const dynamicModule = (fn: any) => {
    return Test.createTestingModule({
      controllers: [MapasController],
      providers: [
        {
          provide: MapasService,
          useValue: fn,
        },
        {
          provide: getModelToken(Point.name),
          useValue: jest.fn(),
        },
        {
          provide: getModelToken(Area.name),
          useValue: jest.fn(),
        },
        {
          provide: getModelToken(MediaRelation.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();
  };

  it('should be defined', async () => {
    const module: TestingModule = await dynamicModule(jest.fn());

    controller = module.get<MapasController>(MapasController);

    expect(controller).toBeDefined();
  });

  it('should createPoint', async () => {
    const module: TestingModule = await dynamicModule({
      create: () => Promise.resolve('123'),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.create({
        title: 'teste',
        description: 'teste',
        latitude: 0,
        longitude: 0,
      }),
    ).toStrictEqual(id);
  });

  it('should createPoint', async () => {
    const module: TestingModule = await dynamicModule({
      createArea: () => Promise.resolve('123'),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.createArea({
        title: 'teste',
        description: 'teste',
        coordinates: [
          {
            latitude: 0,
            longitude: 0,
          },
          {
            latitude: 1,
            longitude: 1,
          },
          {
            latitude: 2,
            longitude: 2,
          },
        ],
      }),
    ).toStrictEqual(id);
  });

  it('should createPoint', async () => {
    const response = {
      id: '123',
      title: 'teste',
      description: 'teste',
      coordinates: [
        {
          latitude: 0,
          longitude: 0,
        },
        {
          latitude: 1,
          longitude: 1,
        },
        {
          latitude: 2,
          longitude: 2,
        },
      ],
    };

    const module: TestingModule = await dynamicModule({
      getArea: () => Promise.resolve(response),
    });

    controller = module.get<MapasController>(MapasController);

    expect(await controller.getArea(id.id)).toStrictEqual(response);
  });

  it('should deleteArea', async () => {
    const module: TestingModule = await dynamicModule({
      deleteArea: () => Promise.resolve(true),
    });

    controller = module.get<MapasController>(MapasController);

    expect(await controller.deleteArea(id.id)).toBeTruthy();
  });
});
