import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // Notez l'utilisation de NestExpressApplication

  // app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.APP_PORT || 3000
  
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
    setHeaders: (res, path, stat) => {
      res.set('Access-Control-Allow-Origin', '*');
    }, 
  }); 
  const cors = {
    origin: function (origin, callback) {
      const allowedOrigins = ['http://localhost:5173', 'http://gh.free.nf', 'http://localhost:5173'];
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error('Not allowed by CORS')); // Reject the request
      } 
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  };   
   
  app.enableCors(cors);    
     
  await app.listen(PORT);  
}  
bootstrap(); 
 