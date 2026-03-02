import { ObjectType, ID, Field } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { QuestionType as SharedQuestionType } from '@forms/shared';

registerEnumType(SharedQuestionType, {
  name: 'QuestionType',
  description: 'Type of form question',
});

@ObjectType()
export class QuestionEntity {
  @Field(() => ID)
  id: string;

  @Field(() => SharedQuestionType)
  type: SharedQuestionType;

  @Field()
  text: string;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field({ nullable: true })
  required?: boolean;
}
