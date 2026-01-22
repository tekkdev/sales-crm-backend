import {
  Controller,
  Get,
  Param,
  Logger,
  ValidationPipe,
  UsePipes,
  Body,
  Put,
} from '@nestjs/common';
import { UserGatewayService } from './user.service';
import { ApiResponse, ApiResponseUtil } from 'src/utils/api-response.util';
import {
  USER_RETRIEVAL_SUCCESS_WITH_ID,
  CONNECTION_SUCCESS_TO_SERVICE,
  USER_UPDATE_SUCCESS_WITH_ID,
} from 'src/constants/success.constant';

// api-gateway/src/api/v1/user/user.controller.ts
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UserGatewayController {
  private readonly logger = new Logger(UserGatewayController.name);

  constructor(
    private readonly userGatewayService: UserGatewayService,
    private readonly apiResponseUtil: ApiResponseUtil,
  ) {}

  @Get('/test-connection')
  async testConnection(): Promise<ApiResponse> {
    const serviceResponse: string | null =
      await this.userGatewayService.testConnection();
    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      CONNECTION_SUCCESS_TO_SERVICE('User Service'),
    );
  }

  @Get('/')
  async getAllUsers(): Promise<ApiResponse> {
    this.logger.log(`📥 API Gateway: Received request for all users`);
    const serviceResponse = await this.userGatewayService.getAllUsers();

    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      USER_RETRIEVAL_SUCCESS_WITH_ID('all users'),
    );
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<ApiResponse> {
    this.logger.log(`📥 API Gateway: Received request for user ID: ${id}`);
    const serviceResponse = await this.userGatewayService.getUserById(id);

    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      USER_RETRIEVAL_SUCCESS_WITH_ID(id),
    );
  }

  @Put('/')
  async updateProfile(@Body() data: any): Promise<ApiResponse> {
    this.logger.log(`📥 API Gateway: Received request to update user profile`);
    const serviceResponse = await this.userGatewayService.updateProfile(data);

    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      USER_UPDATE_SUCCESS_WITH_ID(data.id),
    );
  }
}
