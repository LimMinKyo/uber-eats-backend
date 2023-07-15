import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
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

  async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoriesRepository.findOne({
        where: { slug },
        relations: ['restaurants'],
      });

      if (!category) {
        return {
          ok: false,
          error: 'Category not found.',
        };
      }

      return {
        ok: true,
        category,
      };
    } catch (error) {
      return {
        ok: false,
        error: '',
      };
    }
  }
}
