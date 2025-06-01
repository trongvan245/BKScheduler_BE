import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }));

  const config = new DocumentBuilder()
    .setTitle("BKBotScheduler")
    .setDescription("API description")
    .setVersion("1.1")
    .addBearerAuth()
    .addTag("Authenticate")
    .addTag("Events")
    .addTag("Groups")
    .addTag("Notifications")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Optional: Keeps the token after refreshing the page
    },
  }); //https://github.com/nestjs/swagger/issues/92 add trailing slash to the end of the url
  const allowedOrigins = [
    "http://localhost:5173", // Frontend service 1 (development)
    "http://localhost:8081", // Frontend service 2 (development)
    "http://localhost:4000", // Frontend service 3 (development)
    "https://bkbotscheduler.vercel.app", // Frontend service 1 (production)
  ];

  app.enableCors({ origin: allowedOrigins, methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", credentials: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT") || 5000;

  const gemini_api_key= configService.get<string>("GEMINI_API_KEY");
  console.log(gemini_api_key);
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
