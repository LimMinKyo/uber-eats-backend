import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from '@src/users/entities/user.entity';
import { Restaurant } from '@src/restaurants/entities/restaurant.entity';
import { Dish } from '@src/restaurants/entities/dish.entity';
import { OrderItem } from './entities/order-item.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { retaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: retaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishRepository.findOne({
          where: { id: item.dishId },
        });

        if (!dish) {
          return {
            ok: false,
            error: 'Dish not found.',
          };
        }

        let dishTotalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (option) => option.name === itemOption.name,
          );

          if (dishOption && dishOption.extra) {
            dishTotalPrice += dishOption.extra;

            const choice = dishOption.choices.find(
              (choice) => choice.name === itemOption.choice,
            );

            if (choice && choice.extra) {
              dishTotalPrice += choice.extra;
            }
          }
        }

        totalPrice += dishTotalPrice;

        const orderItem = await this.orderItemRepository.save(
          this.orderItemRepository.create({ dish, options: item.options }),
        );

        orderItems.push(orderItem);
      }

      await this.orderRepository.save(
        this.orderRepository.create({
          customer,
          restaurant,
          items: orderItems,
          total: totalPrice,
        }),
      );

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[] = [];

      if (user.role === UserRole.Client) {
        orders = await this.orderRepository.find({
          where: { customer: { id: user.id }, ...(status && { status }) },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orderRepository.find({
          where: { driver: { id: user.id }, ...(status && { status }) },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurantRepository.find({
          where: { ownerId: user.id },
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat();
        if (status) {
          orders.filter((order) => order.status === status);
        }
      }

      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders.',
      };
    }
  }
}
