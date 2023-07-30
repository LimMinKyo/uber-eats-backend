import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { User } from '@src/users/entities/user.entity';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dtos/update-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { UpdateDishInput, UpdateDishOutput } from './dtos/update-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { CoreOutput } from '@src/common/dtos/output.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    private readonly categoriesRepository: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantRepository.create(
        createRestaurantInput,
      );
      newRestaurant.owner = owner;
      const category = await this.categoriesRepository.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurantRepository.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant.',
      };
    }
  }

  async updateRestaurant(
    owner: User,
    updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: updateRestaurantInput.restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't update a restaurant that you don't own.",
        };
      }

      let category: Category;

      if (updateRestaurantInput.categoryName) {
        category = await this.categoriesRepository.getOrCreate(
          updateRestaurantInput.categoryName,
        );
      }

      await this.restaurantRepository.save([
        {
          id: updateRestaurantInput.restaurantId,
          ...updateRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update Restaurant.',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own.",
        };
      }

      await this.restaurantRepository.delete(restaurantId);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete Restaurant',
      };
    }
  }

  async getAllRestaurants({
    page,
  }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] =
        await this.restaurantRepository.findAndCount({
          order: { isPromoted: 'DESC' },
          take: 25,
          skip: (page - 1) * 25,
        });

      return {
        ok: true,
        results: restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurants.',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['menu'],
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }

      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find restaurant.',
      };
    }
  }

  async searchRestaurant({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] =
        await this.restaurantRepository.findAndCount({
          where: { name: Raw((name) => `${name} ILIKE '%${query}%'`) },
          take: 25,
          skip: (page - 1) * 25,
        });

      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not search Restaurant.',
      };
    }
  }

  async getAllCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categoriesRepository.find();

      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load categories.',
      };
    }
  }

  async getRestaurantCount(category: Category) {
    return this.restaurantRepository.count({
      where: { category: { id: category.id } },
    });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoriesRepository.findOne({
        where: { slug },
      });

      if (!category) {
        return {
          ok: false,
          error: 'Category not found.',
        };
      }

      const restaurants = await this.restaurantRepository.find({
        where: { category: { id: category.id } },
        order: { isPromoted: 'DESC' },
        take: 25,
        skip: (page - 1) * 25,
      });

      const totalResult = await this.getRestaurantCount(category);

      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResult / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load Category.',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: createDishInput.restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurnat not found.',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't create a dish because you don't own restaurant.",
        };
      }

      await this.dishRepository.save(
        this.dishRepository.create({ ...createDishInput, restaurant }),
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create Dish.',
      };
    }
  }

  async updateDish(
    owner: User,
    updateDishInput: UpdateDishInput,
  ): Promise<UpdateDishOutput> {
    try {
      const result = await this.checkDishAndOwner(
        owner.id,
        updateDishInput.dishId,
      );

      if (!result.ok) {
        return result;
      }

      await this.dishRepository.save([
        { id: updateDishInput.dishId, ...updateDishInput },
      ]);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update Dish.',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const result = await this.checkDishAndOwner(owner.id, dishId);

      if (!result.ok) {
        return result;
      }

      await this.dishRepository.delete(dishId);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete Dish.',
      };
    }
  }

  private async checkDishAndOwner(
    ownerId: number,
    dishId: number,
  ): Promise<CoreOutput> {
    const dish = await this.dishRepository.findOne({
      where: { id: dishId },
      relations: ['restaurant'],
    });

    if (!dish) {
      return {
        ok: false,
        error: 'Dish not found.',
      };
    }

    if (ownerId !== dish.restaurant.ownerId) {
      return {
        ok: false,
        error: "You can't do that because you don't own restaurant.",
      };
    }
  }
}
