import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { FormModule } from './form/form.module';
import { ResponseModule } from './response/response.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GqlThrottlerGuard } from './auth/gql-throttler.guard';
import { HealthController } from './health.controller';
import { join } from 'path';

@Module({
  imports: [
    // 60 requests per IP per minute across all GraphQL operations
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
    FormModule,
    ResponseModule,
  ],
  controllers: [HealthController],
  providers: [
    // Apply throttling globally; GqlThrottlerGuard extracts req/res from
    // the GraphQL execution context instead of the raw HTTP context.
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
  ],
})
export class AppModule {}
