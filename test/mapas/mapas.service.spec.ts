import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CreateAreaDto } from '../../src/mapas/dto/create-area.dto';
import { MicrosserviceException } from '../../src/commons/exceptions/MicrosserviceException';
import { Area } from '../../src/mapas/entities/area.schema';
import { Point } from '../../src/mapas/entities/point.schema';
import { MapasService } from '../../src/mapas/mapas.service';
import { MediaRelation } from '../../src/mapas/entities/mediaRelation.schema';
import { MediaRelationDto } from '../../src/mapas/dto/media-relation.dto';
import { CommunityRelation } from '../../src/mapas/entities/communityRelation.schema';
import { CommunityOperationDto } from 'src/mapas/dto/communityOperation.dto';

describe('MapasService', () => {
  let service: MapasService;

  const defaultCreatePointDto = {
    title: 'teste',
    description: 'teste',
    latitude: 0,
    longitude: 0,
    validated: false,
    member: 'memberid',
  };

  const defaultPointDto = {
    title: 'teste',
    description: 'teste',
    type: 'Point',
    coordinates: [0, 0],
    medias: [],
    validated: false,
    member: 'memberid',
  };

  const defaultPoint = {
    title: 'teste',
    description: 'teste',
    coordinates: [0, 0],
    type: 'Point',
    validated: false,
    member: 'memberid',
  };

  const defaultArea = {
    title: 'teste',
    description: 'teste',
    type: 'Polygon',
    medias: [],
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
      {
        latitude: 0,
        longitude: 0,
      },
    ],
  };

  const defaultAreaWithMethods = {
    ...defaultArea,
    save: () => defaultArea,
    delete: () => true,
  };

  const defaultPointWithMethods = {
    ...defaultPoint,
    save: () => defaultPoint,
    delete: () => true,
  };

  const defaultCommunityOperationDto = <CommunityOperationDto>{
    locationId: '1',
    communityId: '1',
  };
  const defaultCommunityRelation = { ...defaultCommunityOperationDto };

  const defaultCommunityRelationWithMethods = {
    ...defaultCommunityRelation,
    save: () => defaultCommunityRelation,
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

  function mockCommunityRelation(dto: any) {
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
    communityFn: any = jest.fn(),
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
        {
          provide: getModelToken(CommunityRelation.name),
          useValue: communityFn,
        },
      ],
    }).compile();
  };

  it('should create point with sucess', async () => {
    const module = await dynamicModule(mockPointModel);
    service = module.get<MapasService>(MapasService);

    expect(await service.createPoint(defaultCreatePointDto)).toBe('123');
  });

  it('should update point with sucess', async () => {
    const module = await dynamicModule({
      findById: () => {
        return {
          ...defaultPointWithMethods,
          save: () => {
            return { id: '123' };
          },
        };
      },
    });
    service = module.get<MapasService>(MapasService);

    expect(
      await service.updatePoint({
        id: '123',
        title: 'new title',
        description: 'new description',
        validated: false,
        member: 'memberid',
      }),
    ).toBe('123');
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
      await service.createPoint(defaultCreatePointDto);
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
      {
        findOneAndDelete: () => true,
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
      {
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
      type: 'Polygon',
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
        {
          latitude: 0,
          longitude: 0,
        },
      ],
    };
    const module = await dynamicModule(
      jest.fn(),
      {
        findById: () => Promise.resolve(response),
      },
      {
        find: () => [],
      },
    );

    service = module.get<MapasService>(MapasService);

    expect(await service.getAreaWithMidia('123')).toEqual(response);
  });

  it('should update area with sucess', async () => {
    const module = await dynamicModule(
      jest.fn(),
      {
        findById: () => {
          return {
            ...defaultAreaWithMethods,
            save: () => {
              return { id: '123' };
            },
          };
        },
      },
      jest.fn(),
    );
    service = module.get<MapasService>(MapasService);

    expect(
      await service.updateArea({
        id: '123',
        title: 'new title',
        description: 'new description',
        validated: false,
        member: 'memberid',
      }),
    ).toBe('123');
  });

  it('should not get area by id', async () => {
    const module = await dynamicModule(jest.fn(), {
      findById: () => Promise.resolve(undefined),
    });

    service = module.get<MapasService>(MapasService);

    try {
      await service.getAreaWithMidia('123');
    } catch (error) {
      expect(error).toBeInstanceOf(MicrosserviceException);
    }
  });

  it('should add media to area', async () => {
    const module = await dynamicModule(
      jest.fn(),
      {
        findById: () => {
          return defaultArea;
        },
      },
      mockMediaRelationModel,
    );
    service = module.get<MapasService>(MapasService);

    expect(
      await service.addMediaToArea({
        mediaId: '123',
        locationId: '123',
      }),
    ).toBe('mock');
  });

  it('should remove media from area', async () => {
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
      await service.deleteMediaFromArea({
        mediaId: '123',
        locationId: '321',
      }),
    ).toBe(true);
  });

  it('should delete area', async () => {
    const module = await dynamicModule(
      jest.fn(),
      {
        findById: () => defaultAreaWithMethods,
      },
      {
        find: () => [],
      },
      {
        findOneAndDelete: () => true,
      },
    );
    service = module.get<MapasService>(MapasService);

    expect(await service.deleteArea('321')).toBe(true);
  });

  it('should delete area and media', async () => {
    const module = await dynamicModule(
      jest.fn(),
      {
        findById: () => defaultAreaWithMethods,
      },
      {
        find: () => [{ locationId: '123', mediaId: '123' }],
        findOneAndDelete: () => true,
      },
      {
        findOneAndDelete: () => true,
      },
    );
    service = module.get<MapasService>(MapasService);

    expect(await service.deleteArea('321')).toBe(true);
  });

  it('should add point to community', async () => {
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
      mockCommunityRelation,
    );

    service = module.get<MapasService>(MapasService);

    expect(await service.addToCommunity(defaultCommunityOperationDto)).toEqual(
      'mock',
    );
  });

  it('should fail to add point to community', async () => {
    const module = await dynamicModule(
      {
        findById: () => {
          return null;
        },
      },
      {
        findById: () => {
          return null;
        },
      },
      jest.fn(),
      mockCommunityRelation,
    );

    service = module.get<MapasService>(MapasService);

    try {
      await service.addToCommunity(defaultCommunityRelation);
    } catch (error) {
      expect(error).toBeInstanceOf(MicrosserviceException);
    }
  });

  it('should get community data', async () => {
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
      {
        find: () => {
          return [defaultCommunityRelationWithMethods];
        },
      },
    );

    service = module.get<MapasService>(MapasService);

    expect(await service.getCommunityData('1')).toEqual({
      points: [defaultPointDto],
      areas: [],
    });
  });
});
