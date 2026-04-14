import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { GqlExceptionFilter } from "./filters/gql-exception.filter";

const DEFAULT_PORT = 4000;

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins ?? true,
    credentials: true,
  });
  
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GqlExceptionFilter(httpAdapter));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const port = Number(process.env.PORT) || DEFAULT_PORT;
  await app.listen(port);
  logger.log(`GraphQL server listening on http://localhost:${port}/graphql`);
}
bootstrap();
