import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { AuthUser } from '@src/auth/auth-user.decorator';
import { User } from '@src/users/entities/user.entity';
import { CreateAccountOutput } from '@src/users/dtos/create-account.dto';
import { Role } from '@src/auth/role.decorator';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dtos/update-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateAccountOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') creatRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateAccountOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      creatRestaurantInput,
    );
  }

  @Mutation(() => UpdateRestaurantOutput)
  @Role(['Owner'])
  async updateRestaurant(
    @AuthUser() owner: User,
    @Args('input') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    return this.restaurantService.updateRestaurant(
      owner,
      updateRestaurantInput,
    );
  }
}
