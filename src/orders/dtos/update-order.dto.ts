import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '@src/common/dtos/output.dto';
import { OrderStatus } from '../entities/order.entity';

@InputType()
export class UpdateOrderInput {
  @Field(() => Int)
  orderId: number;

  @Field(() => OrderStatus)
  status: OrderStatus;
}

@ObjectType()
export class UpdateOrderOutput extends CoreOutput {}
