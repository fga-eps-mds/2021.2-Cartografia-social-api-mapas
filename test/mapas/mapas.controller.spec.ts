import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MediaRelation } from '../../src/mapas/entities/mediaRelation.schema';
import { Area } from '../../src/mapas/entities/area.schema';
import { Point } from '../../src/mapas/entities/point.schema';
import { MapasController } from '../../src/mapas/mapas.controller';
import { MapasService } from '../../src/mapas/mapas.service';
import { CommunityDataDto } from 'src/mapas/dto/communityData.dto';

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
      createPoint: () => Promise.resolve('123'),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.createPoint({
        title: 'teste',
        description: 'teste',
        latitude: 0,
        longitude: 0,
        validated: false,
        member: 'memberid',
      }),
    ).toStrictEqual(id);
  });

  it('should get Point', async () => {
    const response = {
      id: '123',
      title: 'teste',
      description: 'teste',
      medias: [],
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
      getPointWithMidia: () => Promise.resolve(response),
    });

    controller = module.get<MapasController>(MapasController);

    expect(await controller.getPoint(id.id)).toStrictEqual(response);
  });

  it('should addMediaToPoint', async () => {
    const module: TestingModule = await dynamicModule({
      addMediaToPoint: () => Promise.resolve(),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.addMediaToPoint({
        locationId: '123',
        mediaId: '321',
      }),
    ).toStrictEqual(true);
  });

  it('should updatePoint', async () => {
    const module: TestingModule = await dynamicModule({
      updatePoint: () => Promise.resolve('123'),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.updatePoint({
        id: '123',
        title: 'teste',
        description: 'teste',
        validated: false,
        member: 'memberid',
      }),
    ).toStrictEqual(id);
  });

  it('should deletePoint', async () => {
    const module: TestingModule = await dynamicModule({
      deletePoint: () => Promise.resolve(true),
    });

    controller = module.get<MapasController>(MapasController);

    expect(await controller.deletePoint(id.id)).toBeTruthy();
  });

  it('should createArea', async () => {
    const module: TestingModule = await dynamicModule({
      createArea: () => Promise.resolve('123'),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.createArea({
        title: 'teste',
        description: 'teste',
        validated: false,
        member: 'memberid',
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

  it('should addMediaToArea', async () => {
    const module: TestingModule = await dynamicModule({
      addMediaToArea: () => Promise.resolve(),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.addMediaToArea({
        locationId: '123',
        mediaId: '321',
      }),
    ).toStrictEqual(true);
  });

  it('should get Area', async () => {
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
      getAreaWithMidia: () => Promise.resolve(response),
    });

    controller = module.get<MapasController>(MapasController);

    expect(await controller.getArea(id.id)).toStrictEqual(response);
  });

  it('should updateArea', async () => {
    const module: TestingModule = await dynamicModule({
      updateArea: () => Promise.resolve('123'),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.updateArea({
        id: '123',
        title: 'teste',
        description: 'teste',
        validated: false,
        member: 'memberid',
      }),
    ).toStrictEqual(id);
  });

  it('should deleteArea', async () => {
    const module: TestingModule = await dynamicModule({
      deleteArea: () => Promise.resolve(true),
    });

    controller = module.get<MapasController>(MapasController);

    expect(await controller.deleteArea(id.id)).toBeTruthy();
  });

  it('should add point to community', async () => {
    const module: TestingModule = await dynamicModule({
      addToCommunity: () => Promise.resolve('123'),
    });

    controller = module.get<MapasController>(MapasController);

    expect(
      await controller.addToCommunity({ locationId: '1', communityId: '1' }),
    ).toStrictEqual('123');
  });

  it('should get map data from community', async () => {
    const module: TestingModule = await dynamicModule({
      getCommunityData: () =>
        Promise.resolve(<CommunityDataDto>{ points: [], areas: [] }),
    });

    controller = module.get<MapasController>(MapasController);

    expect(await controller.getCommunityData('123')).toStrictEqual({
      points: [],
      areas: [],
    });
  });
});
