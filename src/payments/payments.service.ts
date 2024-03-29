import { Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { User } from '@src/users/entities/user.entity';
import { Restaurant } from '@src/restaurants/entities/restaurant.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurantsRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You don't own restaurant.",
        };
      }

      await this.paymentsRepository.save(
        this.paymentsRepository.create({
          transactionId,
          restaurant,
          user: owner,
        }),
      );

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      this.restaurantsRepository.save(restaurant);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create payment.',
      };
    }
  }

  async getPayments(owner: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.paymentsRepository.find({
        where: { userId: owner.id },
      });

      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load payments.',
      };
    }
  }

  async checkPromotedRestaurnats() {
    const restaurants = await this.restaurantsRepository.find({
      where: { isPromoted: true, promotedUntil: LessThan(new Date()) },
    });

    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurantsRepository.save(restaurant);
    });
  }
}
