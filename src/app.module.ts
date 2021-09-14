import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from './config/configuration';
import { MapasModule } from './mapas/mapas.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(new ConfigService().get('mongo').url),
    MapasModule,
  ],
})
export class AppModule {}
