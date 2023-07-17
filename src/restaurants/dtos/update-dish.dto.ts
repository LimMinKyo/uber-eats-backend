import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';
import { CoreOutput } from '@src/common/dtos/output.dto';

@InputType()
export class UpdateDishInput extends PickType(
  PartialType(Dish),
  ['name', 'options', 'price', 'description'],
  InputType,
) {
  @Field(() => Int)
  dishId: number;
}

@ObjectType()
export class UpdateDishOutput extends CoreOutput {}
