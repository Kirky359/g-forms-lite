import { InputType, Field, ID } from '@nestjs/graphql';
import { MAX_TEXT_LENGTH } from '@forms/shared';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';

@InputType()
export class AnswerInputDto {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TEXT_LENGTH)
  value: string;
}

@InputType()
export class SubmitResponseInputDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  respondentEmail?: string;
}