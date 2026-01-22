import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor() {}

  @MessagePattern({ cmd: 'auth_health_check' })
  healthCheck() {
    this.logger.log('📨 Received health check from API Gateway');

    const response = {
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };

    this.logger.log(
      '📤 Sending health check response to API Gateway',
      response,
    );

    return response;
  }
}
