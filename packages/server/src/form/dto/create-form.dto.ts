import { InputType, Field } from "@nestjs/graphql";
import { QuestionType, MAX_TEXT_LENGTH } from "@forms/shared";
import { IsString, IsNotEmpty, ValidateNested, IsOptional, IsBoolean, MaxLength, IsEnum, IsArray } from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class QuestionInputDto {
  @Field(() => QuestionType)
  @IsEnum(QuestionType)
  type: QuestionType;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TEXT_LENGTH)
  text: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(MAX_TEXT_LENGTH, { each: true })
  options?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_TEXT_LENGTH)
  correctAnswer?: string;
}

@InputType()
export class UpdateFormInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TEXT_LENGTH)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_TEXT_LENGTH)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireEmail?: boolean;

  @Field(() => [QuestionInputDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionInputDto)
  questions: QuestionInputDto[];
}

@InputType()
export class CreateFormInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TEXT_LENGTH)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_TEXT_LENGTH)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireEmail?: boolean;

  @Field(() => [QuestionInputDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionInputDto)
  questions?: QuestionInputDto[];
}