import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { User } from '@src/users/entities/user.entity';
import { Dish } from './dish.entity';
import { Order } from '@src/orders/entities/order.entity';

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class Restaurant extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Column()
  @Field(() => String)
  @IsString()
  coverImg: string;

  @Column()
  @Field(() => String)
  @IsString()
  address: string;

  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Category, { nullable: true })
  category: Category;

  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  @Field(() => User)
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @OneToMany(() => Dish, (dish) => dish.restaurant)
  @Field(() => [Dish])
  menu: Dish[];

  @OneToMany(() => Order, (order) => order.restaurant)
  @Field(() => [Order])
  orders: Order[];
}
