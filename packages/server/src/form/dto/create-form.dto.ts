import { InputType, Field } from "@nestjs/graphql";
import { QuestionType } from "@forms/shared";

@InputType()
export class QuestionInputDto {
  @Field(() => QuestionType)
  type: QuestionType;

  @Field()
  text: string;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field({ nullable: true })
  required?: boolean;
}

@InputType()
export class CreateFormInputDto {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [QuestionInputDto], { nullable: true })
  questions?: QuestionInputDto[];
}
