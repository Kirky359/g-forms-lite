import { Module } from '@nestjs/common';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';

@Module({
  providers: [ResponseResolver, ResponseService],
})
export class ResponseModule {}
