import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => Boolean)
  isVegan: boolean;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => String)
  ownersName: string;

  @Column()
  @Field(() => String)
  categoryName: string;
}
