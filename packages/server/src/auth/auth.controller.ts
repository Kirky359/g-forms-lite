import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CheckMethodsDto } from './dto/check-methods.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('check-methods')
  @HttpCode(200)
  async checkMethods(
    @Body() body: CheckMethodsDto,
  ): Promise<{ methods: string[] }> {
    const methods = await this.authService.checkMethods(body.email);
    return { methods };
  }
}