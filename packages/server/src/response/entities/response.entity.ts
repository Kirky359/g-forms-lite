import { ObjectType, ID, Field, Int } from '@nestjs/graphql';
import { AnswerEntity } from './answer.entity';
import type { Response as SharedResponse } from '@forms/shared';

@ObjectType()
export class ResponseEntity implements SharedResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  formId: string;

  @Field({ nullable: true })
  respondentEmail?: string;

  @Field(() => [AnswerEntity])
  answers: AnswerEntity[];

  @Field(() => Int, { nullable: true })
  score?: number;
}