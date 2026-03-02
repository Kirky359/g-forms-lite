import { Module } from '@nestjs/common';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';
import { FormModule } from '../form/form.module';

@Module({
  imports: [FormModule],
  providers: [ResponseResolver, ResponseService],
})
export class ResponseModule {}
