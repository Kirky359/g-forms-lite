import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ResponseEntity } from './entities/response.entity';
import { ResponseService } from './response.service';
import { AnswerInputDto } from './dto/submit-response.dto';

@Resolver(() => ResponseEntity)
export class ResponseResolver {
  constructor(private readonly responseService: ResponseService) {}

  @Query(() => [ResponseEntity])
  responses(@Args('formId', { type: () => ID }) formId: string): ResponseEntity[] {
    return this.responseService
      .findAllByFormId(formId)
      .map((r) => this.responseService.toResponseEntity(r));
  }

  @Mutation(() => ResponseEntity)
  submitResponse(
    @Args('formId', { type: () => ID }) formId: string,
    @Args('answers', { type: () => [AnswerInputDto] }) answers: AnswerInputDto[],
  ): ResponseEntity {
    const response = this.responseService.submit(formId, answers);
    return this.responseService.toResponseEntity(response);
  }
}
