import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '@src/common/dtos/output.dto';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => [OrderItemOption])
  options: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  restaurantId: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field(() => Int, { nullable: true })
  orderId?: number;
}
