import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AnswerInputDto {
  @Field(() => ID)
  questionId: string;

  @Field()
  value: string;
}
