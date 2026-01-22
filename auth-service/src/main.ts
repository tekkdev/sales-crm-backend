import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  console.log('🔄 Starting Auth Service microservice...');
  console.log(`🐰 Connecting to RabbitMQ at: ${rabbitmqUrl}`);
  console.log('📬 Listening on queue: auth_queue');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'auth_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();

  console.log('✅ Auth Service microservice started successfully');
  console.log('🎯 Ready to receive messages from API Gateway');
}
bootstrap();
