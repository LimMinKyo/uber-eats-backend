import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '@src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class MyRestaurantInput {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class MyRestaurantOutput extends CoreOutput {
  @Field(() => Restaurant)
  restaurant?: Restaurant;
}
