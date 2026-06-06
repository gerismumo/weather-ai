import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/waether.module';

@Module({
  imports: [WeatherModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
