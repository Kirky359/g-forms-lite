import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MAX_TEXT_LENGTH, type Response, type Answer } from '@forms/shared';
import { FormService } from '../form/form.service';
import { ResponseEntity } from './entities/response.entity';
import { AnswerEntity } from './entities/answer.entity';
import type { AnswerInputDto } from './dto/submit-response.dto';

@Injectable()
export class ResponseService {
  private readonly responsesByFormId = new Map<string, Response[]>();

  constructor(private readonly formService: FormService) {}

  findAllByFormId(formId: string): Response[] {
    return this.responsesByFormId.get(formId) ?? [];
  }

  submit(formId: string, answers: AnswerInputDto[]): Response {
    const form = this.formService.findById(formId);
    if (!form) {
      throw new Error(`Form with id ${formId} not found`);
    }
    for (const [index, answer] of answers.entries()) {
      if (answer.value.length > MAX_TEXT_LENGTH) {
        throw new Error(
          `Answer #${index + 1} exceeds ${MAX_TEXT_LENGTH} characters`,
        );
      }
    }

    const id = uuidv4();
    const responseAnswers: Answer[] = answers.map((a) => ({
      questionId: a.questionId,
      value: a.value,
    }));
    const response: Response = {
      id,
      formId,
      answers: responseAnswers,
    };
    const existing = this.responsesByFormId.get(formId) ?? [];
    existing.push(response);
    this.responsesByFormId.set(formId, existing);
    return response;
  }

  toResponseEntity(response: Response): ResponseEntity {
    return {
      id: response.id,
      formId: response.formId,
      answers: response.answers.map((a) => ({
        questionId: a.questionId,
        value: a.value,
      })),
    };
  }
}
