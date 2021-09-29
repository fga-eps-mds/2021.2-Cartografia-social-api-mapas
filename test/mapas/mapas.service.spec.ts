import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CreateAreaDto } from '../../src/mapas/dto/create-area.dto';
import { MicrosserviceException } from '../../src/commons/exceptions/MicrosserviceException';
import { Area } from '../../src/mapas/entities/area.schema';
import { Point } from '../../src/mapas/entities/point.schema';
import { MapasService } from '../../src/mapas/mapas.service';
import { MediaRelation } from '../../src/mapas/entities/mediaRelation.schema';
import { MediaRelationDto } from 'src/mapas/dto/media-relation.dto';
import { PointDto } from 'src/mapas/dto/point.dto';

describe('MapasService', () => {
  let service: MapasService;

  const defaultPointDto = {
    title: 'teste',
    description: 'teste',
    latitude: 0,
    longitude: 0,
  };

  const defaultPoint = {
    title: 'teste',
    description: 'teste',
    coordinates: [0, 0],
    type: 'Point',
  };

  const defaultPointWithMethods = {
    ...defaultPoint,
    save: () => defaultPoint,
    delete: () => true,
  };

  function mockPointModel(dto: any) {
    this.data = dto;
    this.data.id = '123';
    this.save = () => {
      return this.data;
    };
    this.findById = () => {
      return this.data;
    };
  }

  function mockMediaRelationModel(dto: any) {
    this.data = dto;
    this.save = () => {
      this.data.id = 'mock';
      return this.data;
    };
  }

  const dynamicModule = (
    fn: any,
    areaFn: any = jest.fn(),
    mediaFn: any = jest.fn(),
  ) => {
    return Test.createTestingModule({
      providers: [
        MapasService,
        {
          provide: getModelToken(Point.name),
          useValue: fn,
        },
        {
          provide: getModelToken(Area.name),
          useValue: areaFn,
        },
        {
          provide: getModelToken(MediaRelation.name),
          useValue: mediaFn,
        },
      ],
    }).compile();
  };

  it('should create point with sucess', async () => {
    const module = await dynamicModule(mockPointModel);
    service = module.get<MapasService>(MapasService);

    expect(await service.createPoint(defaultPointDto)).toBe('123');
  });

  it('should not get point by id', async () => {
    const module = await dynamicModule({
      findById: () => Promise.resolve(undefined),
    });

    service = module.get<MapasService>(MapasService);

    try {
      await service.getPointWithMidia('123');
    } catch (error) {
      expect(error).toBeInstanceOf(MicrosserviceException);
    }
  });

  it('should get point by id', async () => {
    const module = await dynamicModule(
      {
        findById: () => {
          return defaultPointWithMethods;
        },
      },
      jest.fn(),
      {
        find: () => {
          return [];
        },
      },
    );

    service = module.get<MapasService>(MapasService);

    expect(await service.getPointWithMidia('123')).toEqual({
      ...defaultPoint,
      medias: [],
    });
  });

  it('should add media to point', async () => {
    const module = await dynamicModule(
      {
        findById: () => {
          return defaultPoint;
        },
      },
      jest.fn(),
      mockMediaRelationModel,
    );
    service = module.get<MapasService>(MapasService);

    expect(
      await service.addMediaToPoint({
        mediaId: '123',
        locationId: '123',
      }),
    ).toBe('mock');
  });

  it('should remove media from point', async () => {
    const module = await dynamicModule(jest.fn(), jest.fn(), {
      findOneAndDelete: (dto: MediaRelationDto) => {
        return {
          id: '1',
          ...dto,
        };
      },
    });
    service = module.get<MapasService>(MapasService);

    expect(
      await service.deleteMediaFromPoint({
        mediaId: '123',
        locationId: '321',
      }),
    ).toBe(true);
  });

  it('should failt to create point', async () => {
    const module = await dynamicModule(function mockPointModel(dto: any) {
      this.data = dto;
      this.save = () => Promise.reject(new Error('erro'));
    });
    service = module.get<MapasService>(MapasService);

    try {
      await service.createPoint(defaultPointDto);
    } catch (error) {
      expect(error).toBeInstanceOf(MicrosserviceException);
      expect(error.message).toBe('erro');
    }
  });

  it('should delete point', async () => {
    const module = await dynamicModule(
      {
        findById: () => defaultPointWithMethods,
      },
      jest.fn(),
      {
        find: () => [],
      },
    );
    service = module.get<MapasService>(MapasService);

    expect(await service.deletePoint('321')).toBe(true);
  });

  it('should delete point and media', async () => {
    const module = await dynamicModule(
      {
        findById: () => defaultPointWithMethods,
      },
      jest.fn(),
      {
        find: () => [{ locationId: '123', mediaId: '123' }],
        findOneAndDelete: () => true,
      },
    );
    service = module.get<MapasService>(MapasService);

    expect(await service.deletePoint('321')).toBe(true);
  });

  it('should create area with sucess and no final closing point', async () => {
    const module = await dynamicModule(jest.fn(), mockPointModel);
    service = module.get<MapasService>(MapasService);

    const areaDto = new CreateAreaDto();

    areaDto.title = 'teste';
    areaDto.description = 'teste';
    areaDto.coordinates = [
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
    ];

    expect(await service.createArea(areaDto)).toBe('123');
  });

  it('should create area with sucess and with final closing point', async () => {
    const module = await dynamicModule(jest.fn(), mockPointModel);
    service = module.get<MapasService>(MapasService);

    const areaDto = new CreateAreaDto();

    areaDto.title = 'teste';
    areaDto.description = 'teste';
    areaDto.coordinates = [
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
      {
        latitude: 0,
        longitude: 0,
      },
    ];

    expect(await service.createArea(areaDto)).toBe('123');
  });

  it('should fail to create area', async () => {
    const module = await dynamicModule(
      jest.fn(),
      function mockPointModel(dto: any) {
        this.data = dto;
        this.save = () => Promise.reject(new Error('erro'));
      },
    );

    service = module.get<MapasService>(MapasService);

    const areaDto = new CreateAreaDto();

    areaDto.title = 'teste';
    areaDto.description = 'teste';
    areaDto.coordinates = [
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
    ];

    try {
      await service.createArea(areaDto);
    } catch (error) {
      expect(error).toBeInstanceOf(MicrosserviceException);
    }
  });

  it('should get area by id with sucess', async () => {
    const response = {
      title: 'teste',
      description: 'teste',
      id: '123',
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
        {
          latitude: 0,
          longitude: 0,
        },
      ],
    };
    const module = await dynamicModule(jest.fn(), {
      findById: () => Promise.resolve(response),
    });

    service = module.get<MapasService>(MapasService);

    expect(await service.getArea('123')).toStrictEqual(response);
  });

  it('should not get area by id', async () => {
    const module = await dynamicModule(jest.fn(), {
      findById: () => Promise.resolve(undefined),
    });

    service = module.get<MapasService>(MapasService);

    try {
      await service.getArea('123');
    } catch (error) {
      expect(error).toBeInstanceOf(MicrosserviceException);
    }
  });
});
