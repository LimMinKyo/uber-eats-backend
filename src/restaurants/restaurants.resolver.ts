import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => Boolean)
  async createRestaurant(
    @Args('data') creatRestaurantDto: CreateRestaurantDto,
  ) {
    try {
      await this.restaurantService.createRestaurant(creatRestaurantDto);
      return true;
    } catch (error) {
      return false;
    }
  }
}
