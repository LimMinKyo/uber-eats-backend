import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '@src/common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
