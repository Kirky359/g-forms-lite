import { ObjectType, ID, Field } from '@nestjs/graphql';

@ObjectType()
export class AnswerEntity {
  @Field(() => ID)
  questionId: string;

  @Field()
  value: string;
}
