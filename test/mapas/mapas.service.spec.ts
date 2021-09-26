import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CreateAreaDto } from '../../src/mapas/dto/create-area.dto';
import { MicrosserviceException } from '../../src/commons/exceptions/MicrosserviceException';
import { Area } from '../../src/mapas/entities/area.schema';
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

  const dynamicModule = (fn: any, areaFn: any = jest.fn()) => {
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

  it('should failt to create point', async () => {
    const module = await dynamicModule(function mockPointModel(dto: any) {
      this.data = dto;
      this.save = () => Promise.reject(new Error('erro'));
    });
    service = module.get<MapasService>(MapasService);

    try {
      await service.create({
        title: 'teste',
        description: 'teste',
        latitude: 0,
        longitude: 0,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(MicrosserviceException);
      expect(error.message).toBe('erro');
    }
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
