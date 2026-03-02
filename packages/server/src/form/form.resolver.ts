import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { FormEntity } from "./entities/form.entity";
import { FormService } from "./form.service";
import { CreateFormInputDto, QuestionInputDto } from "./dto/create-form.dto";

@Resolver(() => FormEntity)
export class FormResolver {
  constructor(private readonly formService: FormService) {}

  @Query(() => [FormEntity])
  forms(): FormEntity[] {
    return this.formService
      .findAll()
      .map((f) => this.formService.toFormEntity(f));
  }

  @Query(() => FormEntity, { nullable: true })
  form(@Args("id", { type: () => ID }) id: string): FormEntity | null {
    const form = this.formService.findById(id);
    return form ? this.formService.toFormEntity(form) : null;
  }

  @Mutation(() => FormEntity)
  createForm(
    @Args("title") title: string,
    @Args("description", { nullable: true }) description?: string,
    @Args("questions", { nullable: true, type: () => [QuestionInputDto] })
    questions?: QuestionInputDto[],
  ): FormEntity {
    const form = this.formService.create({
      title,
      description,
      questions: questions ?? [],
    });
    return this.formService.toFormEntity(form);
  }

  @Mutation(() => Boolean)
  deleteForm(@Args("id", { type: () => ID }) id: string): boolean {
    return this.formService.deleteById(id);
  }
}
