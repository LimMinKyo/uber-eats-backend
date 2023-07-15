import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { IsNumber, IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String)
  @Column()
  @IsString()
  photo: string;

  @Field(() => String)
  @Column()
  @Length(5, 140)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;
}
