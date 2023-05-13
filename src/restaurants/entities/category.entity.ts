import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { IsString, Length } from 'class-validator';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class Category extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Column()
  @Field(() => String)
  @IsString()
  coverImg: string;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  @JoinColumn()
  @Field(() => [Restaurant])
  restaurants: Restaurant[];
}
