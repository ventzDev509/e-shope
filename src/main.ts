import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // Notez l'utilisation de NestExpressApplication

  // app.useGlobalPipes(new ValidationPipe());
  const PORT=process.env.APP_PORT
  
  const config = new DocumentBuilder()
    .setTitle(' Projects Gestion ')
    .setDescription('A project gestion api create by american pie ')
    .setVersion('1.0')
    .addTag('american pie')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  // const cors={ 
  //   origin: [`http://localhost:${5173}`],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  // }
  const cors={
    origin: [`https://e-shope-r30g.onrender.com:${PORT}`],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  }

  app.enableCors(cors);
 
  await app.listen(PORT);
}
bootstrap();
