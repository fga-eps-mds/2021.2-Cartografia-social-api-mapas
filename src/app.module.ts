import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MapasModule } from './mapas/mapas.module';

@Module({
  imports: [ConfigModule.forRoot(), MapasModule],
})
export class AppModule {}
