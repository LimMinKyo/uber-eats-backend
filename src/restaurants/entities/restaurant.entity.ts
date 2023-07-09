import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@src/common/entities/core.entity';
import { IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Category } from './category.entity';
import { User } from '@src/users/entities/user.entity';

@Entity()
@ObjectType()
@InputType({ isAbstract: true })
export class Restaurant extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Column()
  @Field(() => String)
  @IsString()
  coverImg: string;

  @Column()
  @Field(() => String)
  @IsString()
  address: string;

  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Category, { nullable: true })
  category: Category;

  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  @Field(() => User)
  owner: User;
}
