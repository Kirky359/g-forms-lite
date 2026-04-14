import { IsEmail } from 'class-validator';

export class CheckMethodsDto {
  @IsEmail()
  email: string;
}