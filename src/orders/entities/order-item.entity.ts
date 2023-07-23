import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { Dish, DishOption } from '@src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class OrderItem extends CoreEntity {
  @Field(() => Dish)
  @ManyToOne(() => Dish, { onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
