import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FormEntity } from './entities/form.entity';
import { FormService } from './form.service';
import { QuestionInputDto } from './dto/create-form.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => FormEntity)
export class FormResolver {
  constructor(private readonly formService: FormService) {}

  @Query(() => [FormEntity])
  @UseGuards(FirebaseAuthGuard)
  async forms(@CurrentUser() user: DecodedIdToken): Promise<FormEntity[]> {
    const forms = await this.formService.findAll(user.uid);
    return forms.map((f) => this.formService.toFormEntity(f));
  }

  // Public query for form respondents — correct answers are stripped
  @Query(() => FormEntity, { nullable: true })
  async form(@Args('id', { type: () => ID }) id: string): Promise<FormEntity | null> {
    const form = await this.formService.findById(id);
    return form ? this.formService.toPublicFormEntity(form) : null;
  }

  @Mutation(() => FormEntity)
  @UseGuards(FirebaseAuthGuard)
  async createForm(
    @CurrentUser() user: DecodedIdToken,
    @Args('title') title: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('requireEmail', { nullable: true }) requireEmail?: boolean,
    @Args('questions', { nullable: true, type: () => [QuestionInputDto] })
    questions?: QuestionInputDto[],
  ): Promise<FormEntity> {
    const form = await this.formService.create(
      { title, description, requireEmail, questions: questions ?? [] },
      user.uid,
    );
    return this.formService.toFormEntity(form);
  }

  @Mutation(() => FormEntity)
  @UseGuards(FirebaseAuthGuard)
  async updateForm(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: DecodedIdToken,
    @Args('title') title: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('requireEmail', { nullable: true }) requireEmail?: boolean,
    @Args('questions', { type: () => [QuestionInputDto] }) questions: QuestionInputDto[] = [],
  ): Promise<FormEntity> {
    const form = await this.formService.update(id, user.uid, {
      title,
      description,
      requireEmail,
      questions,
    });
    return this.formService.toFormEntity(form);
  }

  @Mutation(() => Boolean)
  @UseGuards(FirebaseAuthGuard)
  async deleteForm(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: DecodedIdToken,
  ): Promise<boolean> {
    return this.formService.deleteById(id, user.uid);
  }
}