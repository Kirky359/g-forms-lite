import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ResponseEntity } from './entities/response.entity';
import { ResponseService } from './response.service';
import { AnswerInputDto } from './dto/submit-response.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => ResponseEntity)
export class ResponseResolver {
  constructor(private readonly responseService: ResponseService) {}

  @Query(() => [ResponseEntity])
  @UseGuards(FirebaseAuthGuard)
  async responses(
    @Args('formId', { type: () => ID }) formId: string,
    @CurrentUser() user: DecodedIdToken,
  ): Promise<ResponseEntity[]> {
    const responses = await this.responseService.findAllByFormId(formId, user.uid);
    return responses.map((r) => this.responseService.toResponseEntity(r));
  }

  @Mutation(() => ResponseEntity)
  async submitResponse(
    @Args('formId', { type: () => ID }) formId: string,
    @Args('answers', { type: () => [AnswerInputDto] }) answers: AnswerInputDto[],
    @Args('respondentEmail', { nullable: true }) respondentEmail?: string,
  ): Promise<ResponseEntity> {
    const response = await this.responseService.submit(formId, answers, respondentEmail);
    return this.responseService.toResponseEntity(response);
  }
}