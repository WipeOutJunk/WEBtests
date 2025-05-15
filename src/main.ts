import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser = require('cookie-parser');
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('AI Testing Platform API')
    .setDescription('Документация REST API для дипломного проекта')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

   app.enableCors({
    origin: ['http://localhost:5173'], 
    credentials: true,                 
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
