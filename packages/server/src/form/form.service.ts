import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FormEntity } from './entities/form.entity';
import { QuestionEntity } from './entities/question.entity';
import type { CreateFormInputDto, UpdateFormInputDto } from './dto/create-form.dto';
import type { Form, Question } from '../generated/prisma/client';

type FormWithQuestions = Form & { questions: Question[] };

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<FormWithQuestions[]> {
    return this.prisma.form.findMany({
      where: { userId },
      include: { questions: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<FormWithQuestions | null> {
    return this.prisma.form.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async create(input: CreateFormInputDto, userId: string): Promise<FormWithQuestions> {
    const form = await this.prisma.form.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        requireEmail: input.requireEmail ?? false,
        questions: {
          create: (input.questions ?? []).map((q, index) => ({
            type: q.type,
            text: q.text,
            options: q.options ?? [],
            required: q.required ?? false,
            order: index,
            correctAnswer: q.correctAnswer ?? null,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    this.logger.log(`Created new form with id ${form.id}`);
    return form;
  }

  async update(id: string, userId: string, input: UpdateFormInputDto): Promise<FormWithQuestions> {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form || form.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.form.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description ?? null,
        requireEmail: input.requireEmail ?? form.requireEmail,
        questions: {
          deleteMany: {},
          create: input.questions.map((q, index) => ({
            type: q.type,
            text: q.text,
            options: q.options ?? [],
            required: q.required ?? false,
            order: index,
            correctAnswer: q.correctAnswer ?? null,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    this.logger.log(`Updated form ${id}`);
    return updated;
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form || form.userId !== userId) return false;
    await this.prisma.form.delete({ where: { id } });
    this.logger.log(`Deleted form ${id}`);
    return true;
  }

  toFormEntity(form: FormWithQuestions): FormEntity {
    return {
      id: form.id,
      title: form.title,
      description: form.description ?? undefined,
      requireEmail: form.requireEmail,
      questions: form.questions.map(this.toQuestionEntity),
    };
  }

  // Public form view: strips correct answers so respondents can't read them via API
  toPublicFormEntity(form: FormWithQuestions): FormEntity {
    return {
      id: form.id,
      title: form.title,
      description: form.description ?? undefined,
      requireEmail: form.requireEmail,
      questions: form.questions.map((q) => ({
        ...this.toQuestionEntity(q),
        correctAnswer: undefined,
      })),
    };
  }

  private toQuestionEntity(q: Question): QuestionEntity {
    return {
      id: q.id,
      type: q.type as QuestionEntity['type'],
      text: q.text,
      options: q.options.length > 0 ? q.options : undefined,
      required: q.required,
      correctAnswer: q.correctAnswer ?? undefined,
    };
  }
}