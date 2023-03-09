import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';

@Module({
  imports: [],
  controllers: [],
  providers: [RestaurantResolver],
})
export class RestaurantsModule {}
