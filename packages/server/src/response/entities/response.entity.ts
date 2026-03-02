import { ObjectType, ID, Field } from '@nestjs/graphql';
import { AnswerEntity } from './answer.entity';
import type { Response as SharedResponse } from '@forms/shared';

@ObjectType()
export class ResponseEntity implements SharedResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  formId: string;

  @Field(() => [AnswerEntity])
  answers: AnswerEntity[];
}
