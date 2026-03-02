import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { MAX_TEXT_LENGTH, type Form, type Question } from "@forms/shared";
import { FormEntity } from "./entities/form.entity";
import { QuestionEntity } from "./entities/question.entity";
import type { CreateFormInputDto } from "./dto/create-form.dto";

@Injectable()
export class FormService {
  private readonly forms = new Map<string, Form>();

  findAll(): Form[] {
    return Array.from(this.forms.values());
  }

  findById(id: string): Form | undefined {
    return this.forms.get(id);
  }

  create(input: CreateFormInputDto): Form {
    this.validateTextLength(input.title, "Form title");
    this.validateTextLength(input.description, "Form description");

    for (const [index, question] of (input.questions ?? []).entries()) {
      this.validateTextLength(question.text, `Question #${index + 1} text`);
      for (const [optionIndex, option] of (question.options ?? []).entries()) {
        this.validateTextLength(
          option,
          `Question #${index + 1} option #${optionIndex + 1}`,
        );
      }
    }

    const id = uuidv4();
    const questions: Question[] = (input.questions ?? []).map((q, index) => ({
      id: `${id}-q-${index}`,
      type: q.type,
      text: q.text,
      options: q.options,
      required: q.required,
    }));
    const form: Form = {
      id,
      title: input.title,
      description: input.description,
      questions,
    };
    this.forms.set(id, form);
    return form;
  }

  deleteById(id: string): boolean {
    return this.forms.delete(id);
  }

  toFormEntity(form: Form): FormEntity {
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      questions: form.questions.map(this.toQuestionEntity),
    };
  }

  private toQuestionEntity(q: Question): QuestionEntity {
    return {
      id: q.id,
      type: q.type,
      text: q.text,
      options: q.options,
      required: q.required,
    };
  }

  private validateTextLength(value: string | undefined, fieldName: string): void {
    if (value && value.length > MAX_TEXT_LENGTH) {
      throw new Error(`${fieldName} exceeds ${MAX_TEXT_LENGTH} characters`);
    }
  }
}
