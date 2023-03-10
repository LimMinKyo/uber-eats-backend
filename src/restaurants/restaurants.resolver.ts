import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query(() => [Restaurant])
  restaurants() {
    return this.restaurantService.getAll();
  }

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

  @Mutation(() => Boolean)
  async updateRestaurant(@Args() updateRestaurantDto: UpdateRestaurantDto) {
    try {
      this.restaurantService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (error) {
      return false;
    }
  }
}
