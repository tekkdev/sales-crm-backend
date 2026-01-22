import { Controller, Get, Logger } from '@nestjs/common';
import { ServiceResponseUtil } from './utils/service-response.util';
import { MessagePattern } from '@nestjs/microservices/decorators/message-pattern.decorator';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    // private readonly appService: AppService,
    private readonly responseUtil: ServiceResponseUtil,
  ) {}

  @MessagePattern({ cmd: 'user_health_check' })
  healthCheck() {
    this.logger.log('📨 Received health check from API Gateway');

    const message = 'Test endpoint working for user service';

    this.logger.log('📤 Sending health check response to API Gateway', message);

    return this.responseUtil.createSuccess({
      message,
    });
  }
}
