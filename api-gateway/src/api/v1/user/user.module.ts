import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserGatewayController } from './user.controller';
import { UserGatewayService } from './user.service';
import { ApiResponseUtil } from '../../../utils/api-response.util';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'user_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [UserGatewayController],
  providers: [UserGatewayService, ApiResponseUtil],
})
export class UserModule {}
