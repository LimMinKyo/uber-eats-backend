import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '@src/common/dtos/output.dto';

@InputType()
export class CreatePaymentInput {
  @Field(() => String)
  transactionId: string;

  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}
