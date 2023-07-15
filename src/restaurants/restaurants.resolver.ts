import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
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
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateAccountOutput)
  @Role(['Owner'])
  createRestaurant(
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
  updateRestaurant(
    @AuthUser() owner: User,
    @Args('input') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    return this.restaurantService.updateRestaurant(
      owner,
      updateRestaurantInput,
    );
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }

  @Query(() => RestaurantsOutput)
  allRestaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.getAllRestaurants(restaurantsInput);
  }

  @Query(() => RestaurantOutput)
  restaurant(@Args('input') restaurantInput: RestaurantInput) {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category) {
    return this.restaurantService.getRestaurantCount(category);
  }

  @Query(() => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.getAllCategories();
  }

  @Query(() => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}
