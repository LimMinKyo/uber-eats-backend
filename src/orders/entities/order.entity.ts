import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { Dish } from '@src/restaurants/entities/dish.entity';
import { Restaurant } from '@src/restaurants/entities/restaurant.entity';
import { User } from '@src/users/entities/user.entity';
import { IsNumber } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class Order extends CoreEntity {
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => User)
  customer?: User;

  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
  })
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @ManyToMany(() => Dish)
  @Field(() => [Dish])
  @JoinTable()
  dishes: Dish[];

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus })
  @Field(() => OrderStatus)
  status: OrderStatus;
}
