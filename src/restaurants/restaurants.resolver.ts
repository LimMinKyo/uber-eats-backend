import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
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
  createRestaurant(@Args() creatRestaurantDto: CreateRestaurantDto): boolean {
    console.log(creatRestaurantDto);
    return true;
  }
}
