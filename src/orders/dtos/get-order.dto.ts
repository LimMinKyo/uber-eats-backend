import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { CoreOutput } from '@src/common/dtos/output.dto';

@InputType()
export class GetOrderInput {
  @Field(() => Int)
  orderId: number;
}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
