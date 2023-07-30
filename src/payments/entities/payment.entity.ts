import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { Restaurant } from '@src/restaurants/entities/restaurant.entity';
import { User } from '@src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class Payment extends CoreEntity {
  @Column()
  @Field(() => String)
  transactionId: string;

  @ManyToOne(() => User, (user) => user.payments)
  @Field(() => User)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @ManyToOne(() => Restaurant)
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
