import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column()
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Column()
  @Field(() => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Column()
  @Field(() => String)
  @IsString()
  address: string;

  @Column()
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  ownersName: string;

  @Column()
  @Field(() => String)
  @IsString()
  categoryName: string;
}
