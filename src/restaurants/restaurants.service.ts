import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  createRestaurant(createRestaurantDto: CreateRestaurantDto) {
    const newRestaurant = this.restaurantRepository.create(createRestaurantDto);
    return this.restaurantRepository.save(newRestaurant);
  }
}
