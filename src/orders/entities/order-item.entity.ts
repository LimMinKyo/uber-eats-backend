import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { Dish } from '@src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@ObjectType()
@InputType('OrderItemOptionInputType', { isAbstract: true })
export class OrderItemOption {
  @Field(() => String)
  name: string;

  @Field(() => String)
  choice: string;
}

@Entity()
@ObjectType()
@InputType('OrderItemInputType', { isAbstract: true })
export class OrderItem extends CoreEntity {
  @Field(() => Order)
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @Field(() => Dish)
  @ManyToOne(() => Dish, { onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
