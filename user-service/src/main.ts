import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  console.log('🔄 Starting User Service microservice...');
  console.log(`🐰 Connecting to RabbitMQ at: ${rabbitmqUrl}`);
  console.log('📬 Listening on queue: user_queue');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'user_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  // Global validation pipe for automatic DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen();

  console.log('✅ User Service microservice started successfully');
  console.log('🎯 Ready to receive messages from API Gateway');
}
bootstrap();
