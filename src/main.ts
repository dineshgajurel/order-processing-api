import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.NODE_ENV != 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(process.env.SWAGGER_API_TITLE || 'Order Processing API')
      .setDescription(
        process.env.SWAGGER_API_DESCRIPTION ||
          'Order Processing API Documentation',
      )
      .setVersion(process.env.SWAGGER_API_VERSION || '1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup(
      process.env.SWAGGER_API_PATH || 'api/docs',
      app,
      document,
    );
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
