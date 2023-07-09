import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { IsString, Length } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class Category extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  @Field(() => [Restaurant])
  restaurants: Restaurant[];
}
