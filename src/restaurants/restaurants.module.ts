import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { Category } from './entities/category.entity';
import {
  CategoryResolver,
  DishResolver,
  RestaurantResolver,
} from './restaurants.resolver';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],
  providers: [
    RestaurantService,
    RestaurantResolver,
    CategoryRepository,
    CategoryResolver,
    DishResolver,
  ],
})
export class RestaurantsModule {}
