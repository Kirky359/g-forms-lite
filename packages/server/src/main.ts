import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const DEFAULT_PORT = 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
  });
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  await app.listen(port);
  console.log(`GraphQL server listening on http://localhost:${port}/graphql`);
}
bootstrap();
