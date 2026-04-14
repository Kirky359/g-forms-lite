import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { isValidEmail } from '@forms/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseEntity } from './entities/response.entity';
import type { AnswerInputDto } from './dto/submit-response.dto';
import type { Response, Answer, Question } from '../generated/prisma/client';

type ResponseWithAnswers = Response & { answers: Answer[] };

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllByFormId(formId: string, userId: string): Promise<ResponseWithAnswers[]> {
    return this.prisma.response.findMany({
      where: { formId, form: { userId } },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submit(
    formId: string,
    answers: AnswerInputDto[],
    respondentEmail?: string,
  ): Promise<ResponseWithAnswers> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    });

    if (!form) {
      this.logger.warn(`Submit failed: form ${formId} not found`);
      throw new NotFoundException(`Form with id ${formId} not found`);
    }

    // ── Email requirement ──────────────────────────────────────────────────
    if (form.requireEmail) {
      if (!respondentEmail) {
        throw new BadRequestException('This form requires your email address to submit.');
      }
      if (!isValidEmail(respondentEmail)) {
        throw new BadRequestException('Please enter a valid email address.');
      }
    }

    const score = this.calculateScore(form.questions, answers);

    // ── One submission per email per form ──────────────────────────────────
    try {
      const response = await this.prisma.response.create({
        data: {
          formId,
          respondentEmail: respondentEmail ?? null,
          score,
          answers: {
            create: answers.map((a) => ({
              questionId: a.questionId,
              value: a.value,
            })),
          },
        },
        include: { answers: true },
      });

      this.logger.log(`Response ${response.id} submitted for form ${formId}`);
      return response;
    } catch (err: unknown) {
      // Prisma unique constraint violation
      if ((err as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'You have already submitted this form. Only one submission per email is allowed.',
        );
      }
      throw err;
    }
  }

  private calculateScore(questions: Question[], answers: AnswerInputDto[]): number | null {
    const quizQuestions = questions.filter((q) => q.correctAnswer !== null);
    if (quizQuestions.length === 0) return null;

    let score = 0;
    for (const q of quizQuestions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer || !q.correctAnswer) continue;

      if (q.type === 'CHECKBOX') {
        try {
          const submitted = (JSON.parse(answer.value) as string[]).slice().sort();
          const correct = (JSON.parse(q.correctAnswer) as string[]).slice().sort();
          if (submitted.join('\0') === correct.join('\0')) score++;
        } catch {
          // ignore malformed JSON
        }
      } else if (q.type === 'MULTIPLE_CHOICE') {
        if (answer.value === q.correctAnswer) score++;
      } else {
        if (answer.value.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) score++;
      }
    }
    return score;
  }

  toResponseEntity(response: ResponseWithAnswers): ResponseEntity {
    return {
      id: response.id,
      formId: response.formId,
      respondentEmail: response.respondentEmail ?? undefined,
      answers: response.answers.map((a) => ({
        questionId: a.questionId,
        value: a.value,
      })),
      score: response.score ?? undefined,
    };
  }
}