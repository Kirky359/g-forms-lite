import { ObjectType, ID, Field } from '@nestjs/graphql';
import { QuestionEntity } from './question.entity';
import type { Form as SharedForm } from '@forms/shared';

@ObjectType()
export class FormEntity implements SharedForm {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  requireEmail: boolean;

  @Field(() => [QuestionEntity])
  questions: QuestionEntity[];
}