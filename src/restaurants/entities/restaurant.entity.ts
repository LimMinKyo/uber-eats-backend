import { Field } from '@nestjs/graphql';

export class Restaurant {
  @Field(() => String)
  name: string;

  @Field(() => Boolean, { nullable: true })
  isGood: boolean;
}
