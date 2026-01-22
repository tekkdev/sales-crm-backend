import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  const port = process.env.PORT ?? 5000;

  // Security: Disable x-powered-by header
  app
    .getHttpAdapter()
    .getInstance()
    .decorateReply('setHeader', function (key, value) {
      this.header(key, value);
    });

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onSend', (request, reply, payload, done) => {
      reply.header('X-Powered-By', 'NestJS');
      done();
    });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Compression
  await app
    .getHttpAdapter()
    .getInstance()
    .register(require('fastify-compress'), {
      global: true,
      encodings: ['gzip', 'deflate'],
    });

  // Security headers
  await app.getHttpAdapter().getInstance().register(require('fastify-helmet'), {
    contentSecurityPolicy: false, // Disable CSP for API
  });

  // Global exception filter for centralized error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  await app.listen(port, '0.0.0.0');

  console.log('🚀 API Gateway started successfully');
  console.log(`📡 API Gateway is running on: http://localhost:${port}`);
  console.log('🐰 Attempting to connect to RabbitMQ...');
}
bootstrap();
